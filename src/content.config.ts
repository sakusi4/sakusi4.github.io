import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 폴더 이름을 그대로 URL 슬러그로 쓴다.
 * 기본 generateId는 소문자로 슬러그화해서 대소문자가 있는 기존 URL을 깨뜨린다.
 */
const folderId = ({ entry }: { entry: string }) =>
    entry.replace(/\.md$/, '').replace(/\/index$/, '');

const loadFrom = (dir: string) =>
    glob({ pattern: '**/*.md', base: `./src/content/${dir}`, generateId: folderId });

/** blog / journal 공통 필드. 성격만 다르고 형태는 같다. */
const entrySchema = ({ image }: SchemaContext) =>
    z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().default(''),
        tags: z.array(z.string()).default([]),
        /** 카드 썸네일 겸 og:image. 없으면 사이트 기본 이미지를 쓴다. */
        cover: image().optional(),
        draft: z.boolean().default(false),
        /**
         * Disqus 스레드 식별자. 기본값은 슬러그.
         * 이미 댓글이 달린 글은 예전 식별자를 여기에 고정해야 스레드가 유지된다.
         */
        disqusId: z.string().optional(),
    });

/** 클라이언트 일과 개인 프로젝트를 함께 담는다. 사실 정보만 필드로 둔다. */
const projectSchema = ({ image }: SchemaContext) =>
    z.object({
        title: z.string(),
        date: z.coerce.date(),
        summary: z.string(),
        /** 클라이언트 일일 때만. 개인 프로젝트는 비워둔다. */
        client: z.string().optional(),
        role: z.string().optional(),
        period: z.string().optional(),
        stack: z.array(z.string()).default([]),
        /** 선택. 실제로 측정된 것만. 없으면 비워두는 게 낫다. */
        results: z.array(z.string()).default([]),
        liveUrl: z.string().url().optional(),
        repoUrl: z.string().url().optional(),
        cover: image().optional(),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
    });

export const collections = {
    projects: defineCollection({ loader: loadFrom('projects'), schema: projectSchema }),
    blog: defineCollection({ loader: loadFrom('blog'), schema: entrySchema }),
    journal: defineCollection({ loader: loadFrom('journal'), schema: entrySchema }),
};
