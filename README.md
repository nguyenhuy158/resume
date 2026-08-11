# resume

Personal resume/CV — single static HTML page (Tailwind CDN), served by a Cloudflare Worker with static assets.

Live: https://resume.huyab.click

## Local

```sh
npm install
npm run dev      # http://localhost:8787
```

Edit `public/index.html` — all content lives there. Sections marked `TODO` need real content.

## Deploy

Deploys automatically via Cloudflare Workers Builds on push to `main` (connect the repo in the Cloudflare dashboard: Workers > resume > Settings > Build).

Manual deploy:

```sh
npm run deploy
```

## Print to PDF

Open the page and click "In / Lưu PDF" (or Ctrl+P). Print styles set A4 with 12mm margins and hide the button.
