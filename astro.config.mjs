// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://junpark.me',
    integrations: [sitemap()],
    redirects: {
        // 예전 URL 체계. 색인·외부 링크가 끊기지 않게 유지한다.
        '/posts/Life-2026-02-01': '/journal/2026-02-01-a-new-car/',
    },
});
