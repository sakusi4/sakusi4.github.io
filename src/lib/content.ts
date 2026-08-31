import { getCollection, type CollectionEntry } from 'astro:content';

export type EntryCollection = 'blog' | 'journal';
export type Entry = CollectionEntry<EntryCollection>;
export type Project = CollectionEntry<'projects'>;

const WORDS_PER_MINUTE = 200;

/** draft는 개발 서버에서만 보인다. 빌드 산출물에는 나가지 않는다. */
const isPublished = (entry: { data: { draft: boolean } }) =>
    import.meta.env.DEV || !entry.data.draft;

const byNewest = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
    b.data.date.valueOf() - a.data.date.valueOf();

export async function getEntries<C extends EntryCollection>(
    collection: C,
): Promise<CollectionEntry<C>[]> {
    const entries = await getCollection(collection);
    return entries.filter(isPublished).sort(byNewest);
}

/** featured가 앞, 그다음 최신순. 홈에 먼저 걸리는 순서가 여기서 결정된다. */
export async function getProjects(): Promise<Project[]> {
    const projects = await getCollection('projects');
    return projects.filter(isPublished).sort((a, b) => {
        if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
        return byNewest(a, b);
    });
}

/** 목록과 본문이 같은 숫자를 내도록 항상 원본 마크다운을 기준으로 계산한다. */
export function getReadingTime(body: string | undefined): number {
    const text = (body ?? '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#>*_`~]/g, ' ');
    return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

/** 같은 태그를 많이 공유하는 글 우선, 동점이면 최신순. */
export function getRelated<T extends Entry>(entries: T[], current: T, limit = 3): T[] {
    const tags = new Set(current.data.tags);
    return entries
        .filter((entry) => entry.id !== current.id)
        .map((entry) => ({
            entry,
            score: entry.data.tags.filter((tag) => tags.has(tag)).length,
        }))
        .sort((a, b) => b.score - a.score || byNewest(a.entry, b.entry))
        .slice(0, limit)
        .map(({ entry }) => entry);
}

/** 태그별 글 수. 많이 쓴 태그가 앞. */
export function getTagCounts(entries: Entry[]): { tag: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of entries) {
        for (const tag of entry.data.tags) {
            counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
    }
    return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** URL에 쓰는 태그 슬러그. 표시용 원본과 구분한다. */
export const tagSlug = (tag: string) =>
    tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
});

export const formatDate = (date: Date) => dateFormatter.format(date);
