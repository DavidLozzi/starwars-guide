# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**For AI coding agents:** You may change any part of this file as needed for long-term memory.

## Overview

A fan-created Star Wars website (https://starwars.guide) built with Jekyll and hosted on Netlify. The site is the hub for AurebeshFiles content: it promotes three interactive apps on separate subdomains (Ultimate Star Wars Timeline, HyperPanels comics, SWordle word game), hosts character profile pages, blog posts, and static informational pages.

**This repo is the primary landing page for the whole Star Wars brand.** Everything else is a satellite app on a subdomain; this site is where they are introduced, cross-linked, and indexed. Branding, nav, SEO, and cross-app links are decided here.

## Brand ecosystem — sibling repos

All checked out beside this repo under `/Volumes/T9/git/`. Each has its own `CLAUDE.md`; read it before working there. Only two of them write content back into this repo (see "Generated content" below).

| Repo (local path) | GitHub | What it is | Live at | Writes into this repo? |
|---|---|---|---|---|
| `starwars-guide` (this) | `DavidLozzi/starwars-guide` | Jekyll hub site | starwars.guide (Netlify) | — |
| `starwars-timeline` | `DavidLozzi/starwars-timeline` | React interactive timeline | timeline.starwars.guide (GH Pages from `docs/`) | **yes** — `character/*.md` + images |
| `swordle-data` | `DavidLozzi/swordle-data` | Word-list source of truth + build scripts (Node) | — | **yes** — `swordle-word-list.md` |
| `swordle` | `DavidLozzi/swordle` | React Wordle game FE | wordle.starwars.guide (S3 + CloudFront) | no |
| `hyperpanels/search` | `DavidLozzi/sw-panels-search` | Next.js 15 comic-panel search FE + admin | hyperpanels.starwars.guide (Vercel; Amplify Gen2 auth/S3) | no |
| `hyperpanels/data` | `DavidLozzi/sw-panels-data` | Python ingestion: comic panels → OpenAI Vision → S3 + DynamoDB → Typesense | — | no |
| `hyperpanels/keyboard` | `DavidLozzi/sw-panels-keyboard` | iOS app + custom keyboard over the same Typesense catalog | App Store target | no |
| `clone-defense` | `DavidLozzi/clone-defense` | "Jedi Defense" — vanilla Canvas 2D tower-defense game, zero deps, no build step | **not launched yet**; PRD says it ships into a **subdirectory of this repo** | not yet |

Notes:
- `hyperpanels/` is not itself a repo — it's a folder holding three sibling repos. HyperPanels shares one Typesense `comics` collection across the web FE, the ingestion pipeline, and the iOS client.
- `canonverse` also sits in `/Volumes/T9/git/` — unrelated, ignore it.
- `clone-defense` is the next launch. When it ships, it needs: a home-page app card in `index.markdown`, a landing page like `star-wars-timeline.md`, a nav entry in `_data/navigation.yml`, and sitemap/SEO front matter. It's static and self-contained with relative paths, so it can be dropped in as a subdirectory here (Netlify serving it directly) rather than getting its own subdomain — confirm with the owner before wiring it up.
- The home page app cards in `index.markdown` are the canonical list of launched apps; keep the table above in sync with them.

## Commands

- **First-time setup:** `bundle install` (or `npm run bundle_install`, which also runs `bundle lock --add-platform x86_64-linux` for CI)
- **Local dev:** `npm start` — `bundle exec jekyll serve --watch` + opens http://localhost:4000
- **Production build:** `bundle exec jekyll build` (what Netlify runs), or `npm run bundle_build` to build and serve `_site` on :8080
- **Netlify dev:** `netlify dev` — livereload on port 4000 per `netlify.toml`
- No test suite. Verify changes by building locally and inspecting in the browser.

## Generated content — do not hand-edit

Two content areas in this repo are written by scripts in *other* repos. Edits to them are overwritten on the next sync.

### `swordle-word-list.md` (SWordle three-repo pipeline)

This same overview is duplicated in each repo's agent doc so the picture is available from any angle.

- **`swordle-data`** — **source of truth**. Curated word lists (`starwars.json`, `filler.json`) + `hashData.js`, which emits `values.txt` (encrypted list for the game), `list.html`, and the content of **this repo's `swordle-word-list.md`** (everything after the `<a name="top"></a>` anchor).
- **`swordle`** — React game frontend at wordle.starwars.guide (consumes `values.txt`).
- **`starwars-guide`** (this repo) — Jekyll site; hosts the human-readable word-list page.

When word lists change in swordle-data and land on its `main`, swordle-data's CI fires a `repository_dispatch` (`sync-swordle-wordlist`) at this repo. That triggers `.github/workflows/sync-swordle-wordlist.yml`, which checks out swordle-data + swordle, reruns `hashData.js` (linking this repo's markdown into place as the sibling it expects), and **commits the updated `swordle-word-list.md`** here. Jekyll then rebuilds the site.

```
swordle-data main (word list edit) ──► repository_dispatch "sync-swordle-wordlist"
        └──► starwars-guide sync-swordle-wordlist.yml
                 └──► reruns hashData.js → commits swordle-word-list.md → Jekyll rebuild
```

- Only the front matter / intro **above** the `<a name="top"></a>` anchor is safe to edit.
- Auth: this repo needs the fine-grained PAT `SYNC_REPOS_TOKEN` (contents:read on swordle-data and swordle) for the sync workflow to check them out.

### `character/*.md`

Generated by `starwars-timeline/build_scripts/website.js`, which reads `characters.json` + `character_descriptions.json` from that repo and writes the `.md` files + images straight into this repo (sibling checkout layout required). Historically run manually; as of 2026-07-19 a GitHub Actions workflow is being added in starwars-timeline to run it on build, similar to the SWordle pipeline above.

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
- **Social handles:** primary set is `starwars_77_af` (Threads, BlueSky, Instagram, YouTube). Reddit is `aurebeshFiles` and X is `aurebeshfiles` — no `77_af` variant exists for those. Handles appear in four places that must stay in sync: `index.markdown`, `_includes/footer.html`, `_config.yml:footer_links` (dead code — the layouts use `_includes/footer.html`, not the theme footer — but kept current so it doesn't diverge), and the Organization `sameAs` in `_includes/structured-data.html`. They drifted into two competing identities once; don't let it happen again.
- **App landing pages** opt into `WebApplication` + `BreadcrumbList` JSON-LD with an `app:` block in front matter (`name`, `url`, `category`, optional `os`); `structured-data.html` branches on `page.app` before the layout checks. Each app page also cross-links the other two — keep that when adding a fourth app.
- **Navigation:** defined in `_data/navigation.yml`; `_includes/header.html` renders desktop and mobile menus from it.
- **Responsive breakpoints:** general mobile layout at 768px; hamburger navigation at **1000px and below** via custom `.hamburger-hidden` / `.hamburger-visible` classes — navigation breakpoints intentionally differ from the general mobile breakpoint.
- **Clickable cards:** home page app cards launch the external apps on card click; nested READ links navigate to the local landing pages and must use `event.stopPropagation()`. News items are fully clickable anchors. When making an element clickable, add explicit anchor rules for the card/news-item classes to strip default link styling.
- **Character pages:** link back to `/character` index and cross-link to the timeline app with year-specific URLs.
- **Cursor rules:** `.cursor/rules/reqs.mdc` is always-applied and points back to this file.

## Learnings

If you are corrected, or learn context about the app that would help future sessions, add a bullet here.

- Don't explain everything, just focus on completing the work.
- Media is committed straight into `assets/` with no build-time image pipeline, so oversized files ship as-is. A 2026-07-19 pass cut `assets/` from 99MB to 25MB (video recompressed to 720p, GIFs converted to looping mp4, `assets/death-star/` PNGs converted to JPEG). Compress before committing new media; `ffmpeg` is the tool on hand (this machine's build has no webp encoder).
- Character page headings still skip h2→h4 because the generator emits `<h4>` for each timeline event. Fixing that belongs in `starwars-timeline/build_scripts/website.js`, along with real per-character `social-desc` text (it currently emits `"Name  | Star Wars"`).

## Agent Context

If the **Agent Context Manager** MCP server is available in this environment:

1. **Register a session** at the end of your first interaction: call `register_session` with the absolute repo root path and an `agent_id` (e.g. `cursor-ide`). Reuse the returned `session_id` for the rest of the conversation.
2. **Update context** after finishing the user's requests: call `update_context` with that `session_id` and a summary (two sentences max) of what was asked and what you did.
