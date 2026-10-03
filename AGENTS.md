# Repository Guidelines

## Project Structure & Module Organization

Personal resume/CV, live at <https://resume.huyab.click> (also
`cv.huyab.click`). It is a single static HTML page styled with Tailwind via
CDN, served by a Cloudflare Worker as pure static assets. There is no build
step, no framework, no components and no templating.

Folder structure:

```text
public/
  index.html       # All content, styling (Tailwind CDN + print CSS) and the
                   # inline i18n script (EN/VI strings keyed by data-i18n)
wrangler.jsonc     # Static-asset Worker: assets.directory ./public,
                   # 404-page handling, resume/cv.huyab.click custom domains
e2e/               # Smoke suite (plain fetch, no browser; harness from @huyab/e2e)
  run.mjs          # `pnpm e2e`: start wrangler dev, run the smoke, stop it
  readonly-smoke.mjs # GET-only checks (render, EN/VI i18n keys, 404)
```

- All content and styling lives in `public/index.html`; there is no separate
  JS/CSS pipeline.
- Translatable text uses `data-i18n="<key>"` attributes; every key must exist
  in both the English and Vietnamese dictionaries in the inline `<script>`.
- Print-to-PDF is built in: a button plus `@media print` CSS set A4 page size
  with 12mm margins and hide the button when printing.
- Sections marked `TODO` in `index.html` still need real content.

## Build, Test, and Development Commands

- `pnpm install`: install `wrangler`.
- `pnpm dev`: run `wrangler dev` on `http://localhost:8787`.
- `pnpm build`: validate the Worker config and assets without deploying
  (`wrangler deploy --dry-run`, output in `dist/`).
- `pnpm e2e`: start `wrangler dev` on port 8793 (`E2E_PORT`), run the smoke,
  stop the server.
- `pnpm e2e:prod`: run the same smoke against resume.huyab.click and
  cv.huyab.click.
- `pnpm deploy`: `wrangler deploy` for manual/local deploys only. Pushing to
  `main` deploys automatically through Cloudflare Workers Builds.

Use `pnpm`, not `npm`, for this project. There are no lint/unit-test scripts;
this is a static HTML file.

## Coding Style & Naming Conventions

Keep the page self-contained in `public/index.html`. Use two-space indentation
and Tailwind utility classes; put shared rules (print styles, `avoid-break`) in
the existing `<style type="text/tailwindcss">` block rather than adding new
files. Name i18n keys in camelCase by section, for example `job1Bullet1`.

## Testing Guidelines

`e2e/readonly-smoke.mjs` fetches the page (plain fetch, no browser) and checks
it renders, that every `data-i18n` key exists in both the EN and VI
dictionaries, and that unknown paths 404. It is GET-only, so the same suite runs
locally (`pnpm e2e`, CI `e2e` job) and against production (`pnpm e2e:prod`).
Layout is not covered: verify visual changes by opening `pnpm dev`, toggling
EN/VI, and checking the print preview (A4, button hidden, no section split
across pages).

## Commit & Pull Request Guidelines

Use concise Conventional Commits, for example `feat: add LinkedIn to the
contact line` or `fix: correct the full name`. Pull requests should include a
short summary and a screenshot or PDF export of the visible change.

## Agent-Specific Instructions

Keep responses short and focused. If a requirement is unclear, ask before making
assumptions.
This repo is a printable document, not an app: the single-viewport UI rule used
by the web apps does not apply here. Optimize for an A4 print layout and a
readable mobile/desktop page instead.
