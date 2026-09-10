# sakusi4.github.io

[Chirping Astro](https://github.com/kannansuresh/chirping-astro) 테마 위에 올린 개인 블로그.

```sh
bun install
bun run dev        # localhost:4321
bun run build      # → dist/  (pagefind 검색 인덱스까지 생성)
bun run typecheck
```

## 글 쓰기

`src/content/posts/en/<slug>.md` — 파일 이름이 URL이 된다 (`/posts/<slug>/`).
이미지는 `src/assets/images/posts/<slug>/` 에 두고 상대 경로로 참조한다.

```md
---
title: '글 제목'
pubDate: 2026-09-10
categories: [Dev]        # 사이드바 Categories 메뉴. 하나만.
tags: [astro, notes]
# description: ''        # 선택. 비우면 카드에 요약 줄이 안 나온다.
# draft: true            # 개발 서버에서만 보인다.
---

![](../../../assets/images/posts/<slug>/photo.jpg)
```

## 테마 원본과 다른 점

- 댓글은 Giscus 대신 **Disqus**(`src/components/islands/Disqus.astro`). 설정은 `src/config.ts` → `DISQUS`.
  스레드 식별자 기본값은 `posts/<slug>`. 예전 식별자로 댓글이 달린 글만 frontmatter `disqusId`로 고정한다.
- `description`은 선택 필드. 비어 있으면 카드와 글 상단에서 숨기고 meta는 사이트 설명으로 대체한다.
- 단일 언어(en). `Locale` 타입은 테마 코드 호환을 위해 `'en' | 'fr'`로 두되 `locales`는 `['en']`.
- Privacy 페이지와 GitHub Pages 워크플로 제거.
- 예전 URL(`/posts/Life-2026-02-01`, `/journal/...`, `/writing/...`)은 `astro.config.mjs`의 `redirects`로 잇는다.

## 설정

- 사이트 제목, 소개, 아바타, 메뉴: `src/config.ts`
- 소셜 링크: `.env` 의 `PUBLIC_GITHUB_HANDLE`, `PUBLIC_TWITTER_HANDLE`, `PUBLIC_CONTACT_EMAIL` (`.env.example` 참고)
- 아바타 사진: `src/assets/images/site/avatar.png` 교체. 원형으로 잘리니 정사각형에 가까운 사진이 좋다.
- 테마 색: `src/styles/global.css` 의 daisyUI 토큰

## 배포

GitHub Pages 사용자 사이트. 레포 이름이 `sakusi4.github.io`여야 루트에서 서빙된다.
`main`에 push하면 `.github/workflows/deploy.yml`이 빌드해서 배포한다.
레포 Settings → Pages → Source는 **GitHub Actions**.
