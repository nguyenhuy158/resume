# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal resume/CV — single static HTML page (`public/index.html`, Tailwind via CDN), served by a Cloudflare Worker with static assets (no build step, no framework).

## Commands

```sh
pnpm install
pnpm dev      # wrangler dev, http://localhost:8787
pnpm deploy   # wrangler deploy
```

Use `pnpm`, not `npm`, for this project.

No lint/test scripts — this is a static HTML file.

## Architecture

- All content and styling lives in `public/index.html` — there is no separate JS/CSS pipeline, no components, no templating.
- `wrangler.jsonc` configures the Worker as a pure static-asset server (`assets.directory: ./public`) with two custom domain routes: `resume.huyab.click` and `cv.huyab.click`.
- Deploys automatically via Cloudflare Workers Builds on push to `main` (connected in the Cloudflare dashboard). Just code + commit + push to `main`, no manual deploy step needed. `pnpm deploy` only for manual/local deploys if ever needed.
- Print-to-PDF is a built-in feature: a button plus `@media print` CSS in `index.html` set A4 page size with 12mm margins and hide the button when printing.
- Sections marked `TODO` in `index.html` need real content filled in.
