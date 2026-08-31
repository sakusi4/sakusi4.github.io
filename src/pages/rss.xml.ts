import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../lib/site';
import { getEntries } from '../lib/content';

/** blog + journal 통합 피드. 작업 사례는 글이 아니라 제외. */
export async function GET(context: APIContext) {
    const [blog, journal] = await Promise.all([getEntries('blog'), getEntries('journal')]);
    const items = [...blog, ...journal]
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
        .map((entry) => ({
            title: entry.data.title,
            description: entry.data.description,
            pubDate: entry.data.date,
            link: `/${entry.collection}/${entry.id}/`,
            categories: [...entry.data.tags],
        }));

    return rss({
        title: SITE.name,
        description: SITE.description,
        site: context.site ?? SITE.url,
        items,
    });
}
