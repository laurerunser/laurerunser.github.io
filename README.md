# laure.sys — personal site

A single-page, hash-routed site with four "channels": **About / CV / Personal Projects / Websites I Built / Contact**. Retro-futurist amber-on-black CRT aesthetic with oscilloscope, perspective grid, and a working TV+remote.

## Deploy to GitHub Pages

1. Create a new repo (e.g. `laurerunser.github.io` for a user site, or any name for a project site).
2. Copy the **contents** of this folder (not the folder itself) into the repo root:
   ```
   index.html
   support.js
   favicon.svg
   assets/
   README.md  (this file — optional)
   ```
3. Push to `main`.
4. In the repo: **Settings → Pages → Source: Deploy from branch → Branch: `main` / root → Save**.
5. Wait ~30 seconds. Your site is live at `https://<username>.github.io/` (user site) or `https://<username>.github.io/<repo>/` (project site).

That's it — no build step, no npm, no framework. Just static files.

## Run locally

Open `index.html` directly in a browser — works offline. Or run any static server:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or:
npx serve .
```

## File map

| File | What it is |
|---|---|
| `index.html` | The whole UI — markup, inline styles, and the `<script type="text/x-dc">` logic class. All five "pages" live inside (driven by URL hash: `#home`, `#cv`, `#work`, `#websites`, `#contact`). |
| `support.js` | A tiny client-side template runtime that turns the `<x-dc>` block into a reactive React-ish app. Required — don't remove. |
| `favicon.svg` | Amber-on-black "LR" mark. |
| `assets/rose-bertrand.jpg` | TV channel 1 — Rose Bertrand's site (your friend's portfolio). |
| `assets/motion-home.jpg` | TV channel 2 — In-Motion Art homepage. |
| `assets/sandolore-1.mp4` | TV channel 3, slide 1. |
| `assets/sandolore-2.mp4` | TV channel 3, slide 2. |
| `assets/sandolore-3.mp4` | TV channel 3, slide 3. |

## Editing copy

All text — bio boot-log, CV bullets, channel names, contact rows — lives inside `index.html`. Open it in any editor and search for the line you want to change. The structure is heavily commented (look for `<!-- ============ PAGE: ... ============ -->`).

Common things you'll want to change:

| Want to change | Search for |
|---|---|
| About-page boot log | `_bootLines()` |
| CV career log | `_cvWorkLines()` |
| CV education log | `_cvRestLines()` |
| TV channel labels/links | `this.CH = [` |
| GitHub link target | `github.com/laurerunser` (appears in 3 places) |
| Email obfuscation | `xlaure-runser@tutanota.com` (the leading `x` is the human-check) |

## Video sizes (and how to shrink them)

| File | Current size |
|---|---|
| `assets/sandolore-1.mp4` | ~0.9 MB |
| `assets/sandolore-2.mp4` | ~4.8 MB |
| `assets/sandolore-3.mp4` | ~6.0 MB |
| Total media | ~12 MB |

That's fine for GitHub Pages (no hard total limit, soft 1 GB), but it's a noticeable first-load cost. If you have `ffmpeg` installed locally, you can recompress each video with:

```bash
# Aggressive — ~50–70% smaller, still looks great on a 4:3 TV crop
ffmpeg -i sandolore-2.mp4 -vcodec libx264 -crf 30 -preset slow \
       -vf "scale=640:-2" -an sandolore-2.small.mp4
```

(`-an` strips audio since the TV is muted anyway.) Replace the originals with the `.small.mp4` outputs.

## Customization knobs

- **Animation toggle** — the button bottom-left. Off-state is persisted in `localStorage` under `laure.anim`. Default ON (or honor the user's last choice).
- **CRT overlay intensity** — search for `flicker 7s` and the scanline `rgba(0,0,0,0.16)` to dial them down/up.
- **Nav order / labels** — the `<nav>` block near the top of the body.
- **Amber palette** — primary brand color `#ffb000`, highlight `#ffce5c`, dim `#9c7a2a`. Replace site-wide via find/replace if you want a different tint.

## What this site is NOT

- Not a multi-page-per-URL site. Every "page" lives at the same `index.html` and switches via URL hash (`#cv` etc.). That means simpler hosting but no per-page SEO — fine for a personal site.
- Not built with a framework. No Next.js, no React build step. Just a single HTML file + a 20 KB runtime. If you ever want to migrate to a "real" multi-page site (with proper meta per page, true SSR, asset optimization), an LLM coding assistant can recreate this in Next.js + Tailwind in an afternoon — point it at `index.html` as the design reference.

## License / credits

Your site, your call. The visuals don't include any third-party brand assets — only your own content and code.
