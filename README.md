# junpark.me

```sh
npm run dev      # localhost:4321
npm run build    # → dist/
```

## Adding an entry

`src/content/{projects,blog,journal}/<slug>/index.md` — folder name is the URL,
images go in the same folder.

```yaml
---
draft: true           # dev only
title: "..."
date: "2026-02-01"
description: ""
tags: []
cover: "./cover.jpg"
---
```

`projects` takes `summary` instead of `description`, plus optional
`client`, `role`, `period`, `stack`, `results`, `liveUrl`, `repoUrl`.
Skip `client`/`role` and it reads as a personal project.

## Gotchas

- Site copy is in `src/lib/site.ts`.
- Renaming a slug detaches its Disqus thread — pin the old one with `disqusId`.
