# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**For AI coding agents:** You may change any part of this file as needed for long-term memory.

## Overview

A fan-created Star Wars website (https://starwars.guide) built with Jekyll and hosted on Netlify. The site is the hub for AurebeshFiles content: it promotes three interactive apps on separate subdomains (Ultimate Star Wars Timeline, HyperPanels comics, SWordle word game), hosts character profile pages, blog posts, and static informational pages.

**This repo is the primary landing page for the whole Star Wars brand.** Everything else is a satellite app on a subdomain; this site is where they are introduced, cross-linked, and indexed. Branding, nav, SEO, and cross-app links are decided here.

## Brand ecosystem — sibling repos

All checked out beside this repo under `/Volumes/T9/git/`. Each has its own `CLAUDE.md`; read it before working there. **Four** of them write content back into this repo — `starwars-timeline`, `swordle-data`, `clone-defense`, `flappy-x-wing` (see "Generated content" below).

| Repo (local path) | GitHub | What it is | Live at | Writes into this repo? |
|---|---|---|---|---|
| `starwars-guide` (this) | `DavidLozzi/starwars-guide` | Jekyll hub site | starwars.guide (Netlify) | — |
| `starwars-timeline` | `DavidLozzi/starwars-timeline` | React interactive timeline | timeline.starwars.guide (GH Pages from `docs/`) | **yes** — `character/*.md` + images |
| `swordle-data` | `DavidLozzi/swordle-data` | Word-list source of truth + build scripts (Node) | — | **yes** — `swordle-word-list.md` |
| `swordle` | `DavidLozzi/swordle` | React Wordle game FE | wordle.starwars.guide (S3 + CloudFront) | no |
| `hyperpanels/search` | `DavidLozzi/sw-panels-search` | Next.js 15 comic-panel search FE + admin | hyperpanels.starwars.guide (Vercel; Amplify Gen2 auth/S3) | no |
| `hyperpanels/data` | `DavidLozzi/sw-panels-data` | Python ingestion: comic panels → OpenAI Vision → S3 + DynamoDB → Typesense | — | no |
| `hyperpanels/keyboard` | `DavidLozzi/sw-panels-keyboard` | iOS app + custom keyboard over the same Typesense catalog | App Store target | no |
| `clone-defense` | `DavidLozzi/clone-defense` | "Jedi Defense" — vanilla Canvas 2D tower-defense game, zero deps, no build step | **live**; ships as a **subdirectory of this repo** (`starwars.guide/clone-defense/play/`, Netlify-served, no subdomain) | **yes** — `clone-defense/play/` |
| `flappy-x-wing` | `DavidLozzi/flappy-x-wing` | "Red Five" — Death Star trench run, Flappy-Bird mechanics, vanilla Canvas 2D, zero deps, no build step | **live**; ships as a **subdirectory of this repo** (`starwars.guide/red-five/play/`, Netlify-served, no subdomain) | **yes** — `red-five/play/` |

Notes:
- `hyperpanels/` is not itself a repo — it's a folder holding three sibling repos. HyperPanels shares one Typesense `comics` collection across the web FE, the ingestion pipeline, and the iOS client.
- `canonverse` also sits in `/Volumes/T9/git/` — unrelated, ignore it.
- **Two apps ship as subdirectories of this repo instead of subdomains**: `clone-defense` and `flappy-x-wing`/Red Five (both live as of 2026-08-18). Both are static, dependency-free and use relative paths, so Netlify serves them straight out of this repo. Everything below about `/clone-defense/` vs `/clone-defense/play/` applies verbatim to `/red-five/` vs `/red-five/play/` — the directory-collision permalink rule especially.
- `clone-defense` was the first app to live *inside* this repo rather than on a subdomain (launched; news item `clone-defense-launch`). **Two URLs, and they must not be confused:**
  - `/clone-defense/` — the Jekyll landing page (`clone-defense.md`, which sets an explicit `permalink: /clone-defense/`). This is the indexable, SEO-bearing page; nav and the home card's READ button point here.
  - `/clone-defense/play/` — the game itself, a synced static build. The home card's LAUNCH button and the in-page "Play" links point here, as does the `app.url` in the landing page's front matter.

  The landing page needs the explicit permalink because without it Jekyll emits `/clone-defense.html`, which Netlify resolves ambiguously against the `clone-defense/` directory — the game would win and the landing page would be unreachable. The game is a bare app shell (no meta description, no canonical) and is kept out of `sitemap.xml` by a `sitemap: false` default in `_config.yml` so it can't cannibalise the landing page in search. (As of 2026-08-10 every top-level page carries a trailing-slash permalink — see "Every top-level page sets a trailing-slash `permalink`" under Conventions — so this is no longer the odd one out, but the *reason* here is the directory collision, not just URL style.)
- `flappy-x-wing` is the newest app (added 2026-08-11, **shipped 2026-08-18**). **The local folder is `flappy-x-wing` but the game is named Red Five**, and the public URL uses the game name, not the folder name. Everything hub-side is done: `red-five.md` landing page (`permalink: /red-five/`, `app:` block → `https://starwars.guide/red-five/play/`), `assets/cards/red-five.png`, `assets/red-five/icons/` sprites, the `red-five` row in `_data/products.yml` and `_data/games.yml`, the `red-five/play` `sitemap: false` default in `_config.yml`, the synced `red-five/play/` build (game repo pushes `chore: sync red-five build` commits here), the Games nav entry, the home-page card, the About entry, the `red-five-launch` news item, and reciprocal cross-links from the other four landing pages. The landing page is deliberately **in** `sitemap.xml`; only `red-five/play/` is held out.
  - Color note: **yellow-400** — it was briefly orange-400; the leftover `--orange-400` variable and `.text-orange-400` class in `_sass/_new-design.scss` now serve only the Reddit social link and `.social-card.border-orange-400`.
- The home page app cards in `index.markdown` are the canonical list of launched apps; keep the table above in sync with them.

## Commands

- **First-time setup:** `bundle install` (or `npm run bundle_install`, which also runs `bundle lock --add-platform x86_64-linux` for CI)
- **Local dev:** `npm start` — `bundle exec jekyll serve --watch` + opens http://localhost:4000
- **Production build:** `bundle exec jekyll build` (what Netlify runs), or `npm run bundle_build` to build and serve `_site` on :8080
- **Netlify dev:** `netlify dev` — livereload on port 4000 per `netlify.toml`
- No test suite. Verify changes by building locally and inspecting in the browser.

## Generated content — do not hand-edit

Four content areas in this repo are written by CI in *other* repos. Edits to them are overwritten on the next sync. Shared conventions: a fine-grained PAT named `SYNC_REPOS_TOKEN` and a `github-actions[bot]` commit straight to this repo's `main`. The three workflows that push *into* here from outside (`starwars-timeline`, `clone-defense`, `flappy-x-wing`) each carry a `Verify cross-repo token access` step that fails loud if the PAT lost its grant, and each hold the PAT on their own repo with `starwars-guide` Contents read+write. The SWordle path is the exception: this repo does its own commit with its own `GITHUB_TOKEN`, so its `SYNC_REPOS_TOKEN` is read-only and used only for checkouts, and it has no verify step. Every such push fires the Netlify webhook and rebuilds the site (a `GITHUB_TOKEN` push suppresses downstream *GitHub Actions*, not third-party webhooks).

### `swordle-word-list.md` (SWordle three-repo pipeline)

This same overview is duplicated in each repo's agent doc so the picture is available from any angle.

- **`swordle-data`** — **source of truth**. Curated word lists (`starwars.json`, `filler.json`) + `hashData.js`, which emits `values.txt` (encrypted list for the game), `list.html`, and the content of **this repo's `swordle-word-list.md`** (everything after the `<a name="top"></a>` anchor).
- **`swordle`** — React game frontend at wordle.starwars.guide (consumes `values.txt`).
- **`starwars-guide`** (this repo) — Jekyll site; hosts the human-readable word-list page.

**Exactly when this repo's copy updates.** swordle-data's `sync-downstream.yml` is gated on `push` to `main` with `paths: [starwars.json, filler.json, hashData.js]` (plus manual `workflow_dispatch`) — any other commit to swordle-data, this repo never hears about; a `hashData.js`-only edit *does* fire it. That job pushes `values.txt` to the `swordle` repo, then fires a `repository_dispatch` (`sync-swordle-wordlist`) at this repo, then commits its own regenerated artifacts with `[skip ci]`.

The dispatch triggers `.github/workflows/sync-swordle-wordlist.yml` here, which checks out **swordle-data pinned to `client_payload.swordle_data_sha`** (so the page matches the exact triggering commit) and **swordle at floating `main`** (only so `hashData.js`'s `../swordle/src/values.txt` write has a target — this repo never commits it), symlinks this repo's markdown to the `../starwars-guide/swordle-word-list.md` path `hashData.js:138` hardcodes, `git pull --rebase origin main`, reruns `hashData.js`, and **commits the updated `swordle-word-list.md`** here. Jekyll then rebuilds. End to end: two back-to-back CI runs, a few minutes.

`hashData.js` runs twice against different content, and only the second run counts: swordle-data's run stubs the markdown to a bare `<a name="top"></a>` and discards the result, so this repo's hand-written intro survives because the rerun here reads the real file.

```
swordle-data main (word list edit) ──► repository_dispatch "sync-swordle-wordlist"
        └──► starwars-guide sync-swordle-wordlist.yml
                 └──► reruns hashData.js → commits swordle-word-list.md → Jekyll rebuild
```

- Only the front matter / intro **above** the `<a name="top"></a>` anchor is safe to edit.
- Auth: this repo needs the fine-grained PAT `SYNC_REPOS_TOKEN` (contents:read on swordle-data and swordle) for the sync workflow to check them out. swordle-data needs its own copy (write on `swordle`, read on `starwars-guide` for the dispatch).
- **Known race (unfixed, found 2026-09-08):** `sync-swordle-wordlist.yml` has no `concurrency` group and no push retry, while swordle-data's side does (`group: sync-downstream`). If `starwars-timeline`'s character sync pushes to this repo's `main` in the window between this workflow's `git pull --rebase` and its `git push`, the push is rejected and the word list silently stays stale until the next word change. Fix is a `concurrency:` group plus a pull-rebase-retry loop around the push.

### `character/*.md`

Generated by `starwars-timeline/build_scripts/website.js`, which reads `characters.json` + `character_descriptions.json` from that repo and writes the `.md` files + images straight into this repo (sibling checkout layout required). Historically run manually; **automated since 2026-07-19 and live** — verified 2026-09-08.

`starwars-timeline/.github/workflows/node.js.yml` (its main build) does the push, on `push` to `main` only, and only when `SYNC_REPOS_TOKEN` is set on *that* repo (fine-grained PAT, `DavidLozzi/starwars-guide` Contents **read and write**); without the secret the sync steps skip and the build still passes. Order matters there: the sync steps run *after* its `add-and-commit`, which stages `.` and would otherwise commit this repo's checkout as a gitlink. `website.js` writes to `../../starwars-guide` relative to `build_scripts/`, so CI symlinks the checkout to `$GITHUB_WORKSPACE/../starwars-guide`.

It commits **`character/` and `assets/characters/`** with the message `chore: sync character pages from starwars-timeline (<repo>@<sha>)`.

### `clone-defense/play/` and `red-five/play/`

Both game repos (`clone-defense`, `flappy-x-wing`) run an identical `sync-to-hub.yml` on `push` to `main`: run tests, `node dev/build.mjs --clean --out dist`, stamp a version into the **dist copy only**, then minify with **per-file esbuild (no bundling)** so the ES-module graph and filenames survive and the relative imports in `index.html` keep working. Minification happens only in CI — the game repos themselves stay zero-dependency with no build step.

The sync step does `rm -rf` then `cp -r dist/.` — a **wholesale replace**, because `cp` never deletes and renamed/removed files would otherwise linger forever. It is scoped to exactly `<game>/play/`; the parent `clone-defense/` and `red-five/` hold the hand-authored Jekyll landing pages and must never be touched by it. Sync steps are skipped on `pull_request` and when the PAT is absent, so forks still pass.

## Centralized news feed

This repo is the source of truth for news/updates (seeded 2026-08-08 from `swordle/src/news.json`).

**One list, classified by product.** `/news/` is the single stream — short blurbs *and* blog posts, sorted together, filterable by product chip. There is no per-product list: `product` is a label for the badge and chips, not a scope. Blurbs and long-form keep separate storage so a one-line update doesn't have to become a thin indexable page.

- **`_data/news.json`** — short items. Fields: `id` (kebab slug, used as the `/news/#anchor`), `date` (ISO), `product` (key from `_data/products.yml`), `title`, `message` (HTML allowed), optional `url` for a call-to-action link, optional `link_text` for that link's label. **`url` must be an absolute `https://starwars.guide/...` URL** — the satellite apps render these items on their own origins, so a root-relative path would resolve against wordle./timeline./hyperpanels.starwars.guide and 404.
- **`_posts/*.md`** — long-form. Each post needs a `product:` front-matter key (defaults to `site`), and takes the same optional `link_text:`. **Don't use `app:` for this** — that key already triggers `WebApplication` JSON-LD in `structured-data.html`.
- **`link_text`** — per-item label for the read-more link, defaulting to `"Read more"`. Set it when the link isn't an article ("Play Now", "See the word list"). Both hub renderers wrap it in an `uppercase` class, so author it in natural case; `news-feed.json` emits it un-upcased and always present, so satellites need no fallback. The label only shows where there's a link: `/news/` hides it when a blurb has no `url`, and the home page does too (the card itself still links to the item's `/news/#id` anchor).
- **`_data/products.yml`** — display metadata per product key (name, FontAwesome icon, color token, landing-page URL). Add a row before using a new `product` key. `comics` has no landing page, so its badge links back to its own filter.
- **`/news/`** (`news.md`) — the stream, newest-first, with product chips (`?product=swordle` deep-links a filter). The home page shows the newest 3 of the same stream.
- **`/news-feed.json`** (`news-feed.json`, `layout: null`) — machine-readable copy of the whole stream for the satellite apps; CORS + 5-min cache headers in `netlify.toml`, kept out of the sitemap via `sitemap: false`.
- **Merge mechanics:** Liquid can't sort a mixed array of post Documents and data hashes, so `news.md`, `news-feed.json`, and `index.markdown` each build a sortable index of `"YYYY-MM-DD~type~index"` strings, sort that, then dereference back to the source collection. A post whose URL appears as some blurb's `url` is skipped, so a linked pair shows once. Those three copies must stay in sync.
- **`/posts`** still exists and is indexed but is deliberately **not in the nav** — `/news/` is the one list users are pointed at.
- Satellite apps should fetch `/news-feed.json` instead of shipping their own list. All four consumers do (`starwars-timeline/src/hooks/useNewsFeed.js`, `swordle/src/components/news/useNewsFeed.js`, `hyperpanels/search/app/hooks/useNewsFeed.js`, `clone-defense/src/config/globals.js`); SWordle's bundled `src/news.json` was deleted 2026-08-08. **`flappy-x-wing`/Red Five does not consume the feed** — it is the one app with no news surface (gap, not a bug; verified 2026-09-08). Outstanding follow-up: all four consumers still hardcode a "Read more" literal instead of reading `item.link_text`.

## Architecture

- **Static site generator:** Jekyll 4.x with the `jekyll-theme-so-simple` remote theme. Content is Markdown with YAML front matter; layouts and includes are Liquid templates.
- **Content types:**
  - **Home page** (`index.markdown`, `home` layout) — app cards, social links, recent posts feed
  - **Character pages** — timeline profiles under `character/`, `character` layout
  - **Blog posts** — dated entries in `_posts/`, `posts` layout
  - **Static pages** — app landing pages (`star-wars-timeline.md`, `hyper-panels.md`, `swordle-star-wars-wordle.md`), support page, etc.
- **Interactive apps** live on separate subdomains, linked from the home page cards: `timeline.starwars.guide`, `hyperpanels.starwars.guide`, `wordle.starwars.guide`.
- **Styling:** Custom SCSS compiled via Jekyll (`assets/css/lozzi.scss` imports `_sass/` partials; `_new-design.scss` is the bulk). Utility-class naming is Tailwind-*like* but hand-written in SCSS — there is no Tailwind build step, so Tailwind classes not defined in `_sass/` will do nothing.
- **CMS:** Netlify CMS at `/admin` (git-gateway backend) for posts and select pages.
- **Deployment:** Netlify only (`netlify.toml`). The GitHub Pages workflow was deleted 2026-07-19 — it published a duplicate copy of the site from the same repo, which splits search signals. Don't re-add it.
- **`<head>`:** all four layouts share `_includes/head.html` (title, description, canonical, OpenGraph/Twitter, GA4, AdSense, Bing verification) which pulls in `_includes/structured-data.html` for JSON-LD. Never inline meta tags in a layout — that produces duplicate tags. `head.html` also normalizes the generator's double-spaced `social-desc` values at render time.

## Conventions

- **Front matter:** every page needs SEO fields (`title`, `description` or `social-desc`, `social-image`, `social-title` where applicable) plus `date` and `last_modified_at` for sitemap.xml and SEO.
- **SEO defaults live in the layout, not the content.** Because character pages and the SWordle word list are generated, anything that must apply to them (descriptions, canonical, JSON-LD, cross-links, headings) belongs in `_includes/head.html` or `_layouts/character.html`. `character.html` builds the character-to-character link ring by sorting `site.pages | where: "layout", "character"` and linking the 8 that follow alphabetically, so every page gets inbound links without touching generated files.
- **Social handles:** primary set is `starwars_77_af` (Threads, BlueSky, Instagram, YouTube, and as of 2026-08-18 X too — `https://x.com/starwars_77_af`, previously `aurebeshfiles`). Reddit is `aurebeshFiles` — no `77_af` variant exists there. `@UltStarWarsTime` is a separate Timeline-only X account and is intentionally left alone. Handles appear in four places that must stay in sync: `index.markdown`, `_includes/footer.html`, `_config.yml:footer_links` (dead code — the layouts use `_includes/footer.html`, not the theme footer — but kept current so it doesn't diverge), and the Organization `sameAs` in `_includes/structured-data.html`. They drifted into two competing identities once; don't let it happen again.
- **`/games/` is the games hub** (`games.md`, `permalink: /games/`), driven by `_data/games.yml` — a separate list from `_data/products.yml` (which is news-badge metadata only). One DOM per game: a `.game-icon` button and a `.game-panel` card. Desktop (>768px) hides the icons and lays the panels out as a card grid; mobile (<=768px) shows the icons as a springboard and opens a panel as a fixed-position modal (`.is-open`) over `.games-backdrop`, driven by the inline script at the bottom of `games.md`. Three gotchas the CSS already works around, all from `.prose` in `_layouts/page.html`: `.prose div a` underlines every anchor with `!important`, `.prose h2` forces a yellow color plus a blue left bar, and the `.game-panel` border shorthand outranks the generic `.border-*` utilities — hence the doubled-up `.prose .game-panel a` / `.game-panel .game-panel-title` / `.game-panel.border-*` selectors. Colors come from the red/yellow/blue `.card`/`.btn` variants only; no green/purple/orange variants exist. `icon_image` in `_data/games.yml` is the springboard icon, currently the wide card art cropped square by `object-fit: cover` — swap those paths when real square icon art lands.
- **Nav parents with `children` render as a `<button>` (toggle-only) unless the item also sets `url`, in which case the title renders as a link** (`_includes/header.html:27-34` desktop, `:46-52` mobile) — that's how Games is both a dropdown of the three game landing pages and a direct link to `/games/`.
- **App landing pages** opt into `WebApplication` + `BreadcrumbList` JSON-LD with an `app:` block in front matter (`name`, `url`, `category`, optional `os`); `structured-data.html` branches on `page.app` before the layout checks. Each app page also cross-links the other two — keep that when adding a fourth app.
- **Every top-level page sets a trailing-slash `permalink`** (`permalink: /about/`), and every link to it — nav, `_data/products.yml`, `_data/news.json`, in-page anchors — uses that exact trailing-slash form. Without a permalink Jekyll emits `/about.html` and makes that the canonical, while Netlify *also* serves the extensionless `/about` with a 200; Google then indexes the `.html` URL and files every internally-linked URL as "Alternate page with proper canonical tag" (all 4 static pages, found 2026-08-10). `netlify.toml` holds a 301 per page from the old `.html` URL — don't drop those, they're the only path from the already-indexed URLs. Blog posts keep their dated `.html` permalinks; those are linked as `.html` everywhere, so they're already consistent.
- **Launch tracking:** any element with `data-launch-app="<product key>"` (plus optional `data-launch-surface`) fires one GA4 `launch_app` event. The delegated listener lives at the bottom of `_includes/footer.html` and runs in the **bubble** phase on purpose — nested READ links call `event.stopPropagation()`, so they never reach it and never mis-attribute as a launch. That same `stopPropagation` is why `games.md` binds its own direct listeners instead of relying on the delegated one. Tagged surfaces: `home-card`, `landing`, `footer-band`, `games-hub-button`, `games-hub-card`.
- **Footer "try another app" band:** `_includes/footer.html` renders one icon link per app straight from `_data/products.yml`, skipping the `site` and `comics` keys (they have no landing page). Adding an app to `products.yml` puts it in the band automatically — including on all generated character pages, since all four layouts include the footer. `short_name` overrides the band label when `name` is too long.
- **Navigation:** defined in `_data/navigation.yml`; `_includes/header.html` renders desktop and mobile menus from it.
- **Responsive breakpoints:** general mobile layout at 768px; hamburger navigation at **1000px and below** via custom `.hamburger-hidden` / `.hamburger-visible` classes — navigation breakpoints intentionally differ from the general mobile breakpoint.
- **Clickable cards:** home page app cards launch the external apps on card click; nested READ links navigate to the local landing pages and must use `event.stopPropagation()`. News items are fully clickable anchors. When making an element clickable, add explicit anchor rules for the card/news-item classes to strip default link styling.
- **Character pages:** link back to `/character` index and cross-link to the timeline app with year-specific URLs.
- **Cursor rules:** `.cursor/rules/reqs.mdc` is always-applied and points back to this file.

## Learnings

If you are corrected, or learn context about the app that would help future sessions, add a bullet here.

- Don't explain everything, just focus on completing the work.
- Media is committed straight into `assets/` with no build-time image pipeline, so oversized files ship as-is. A 2026-07-19 pass cut `assets/` from 99MB to 25MB (video recompressed to 720p, GIFs converted to looping mp4, `assets/death-star/` PNGs converted to JPEG). Compress before committing new media; `ffmpeg` is the tool on hand (this machine's build has no webp encoder).
- Character page generator issues, all fixed upstream in `starwars-timeline` and verified here 2026-09-08: the h2→h4 heading skip is gone (`website.js` demotes h4 to h3 — built character pages contain zero `<h4>`); the double-spaced `"Name  | Star Wars"` social-desc is gone from current output (head.html still normalizes double spaces, but nothing live produces them); and `social-desc` is now purpose-written per character by `description.js` (`socialDesc` in PROFILE_SCHEMA, with a `--social-only` backfill pass) instead of a truncated bio, so no character description ends in an ellipsis. All 79 are unique, 133–160 chars. Two sit at exactly 160 and 10 above 155 — Google truncates on pixel width, so those may still clip in SERPs; the fix is dropping the generator ceiling to ~155 and re-running `--social-only --all` in `starwars-timeline`, not editing the .md files here.
- **Keep every URL lowercase.** Netlify 301s any request path containing an uppercase letter to its lowercase form (`/character/Chewbacca.html` → `/character/chewbacca`). Character pages were named `Chewbacca.md`, so the sitemap and the `canonical` tag both pointed at a redirect — Search Console filed all ~79 of them under "Page with redirect, not indexed" (found 2026-08-10). Fixed by lowercasing the filenames here and the `slug()` helper in `starwars-timeline/build_scripts/website.js` that writes them. Percent-encoded bytes are untouched by the rule (`padm%C3%A9-…` stays valid), and a lowercase `.html` URL serves 200, so the `.html` suffix itself is fine. Never add a page with a capital letter in its filename.

## Agent Context

If the **Agent Context Manager** MCP server is available in this environment:

1. **Register a session** at the end of your first interaction: call `register_session` with the absolute repo root path and an `agent_id` (e.g. `cursor-ide`). Reuse the returned `session_id` for the rest of the conversation.
2. **Update context** after finishing the user's requests: call `update_context` with that `session_id` and a summary (two sentences max) of what was asked and what you did.
