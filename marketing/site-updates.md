# Proposed Site Updates — starwars.guide

*Concrete, buildable changes to this Jekyll repo in support of the campaign. Ordered by impact. Drafted 2026-07-21.*

## P0 — Clone Defense launch wiring (blocks launch)

Per `clone-defense/CLAUDE.md` launch checklist — all in this repo. **Subdirectory deploy confirmed by owner 2026-07-21**: the game ships as a static folder in this repo, served by Netlify at `starwars.guide/clone-defense/`, no subdomain.

1. **Fourth app card** in `index.markdown`, matching the existing three-card pattern. Suggested accent: green (`border-green-400`) — currently unused by any app card, and it's the lightsaber color the game leans on. Card copy: "One Jedi. Fifteen planets. How long can you hold the line?"
2. **Landing page** `clone-defense.md` modeled on `star-wars-timeline.md`, with the `app:` front-matter block (`name`, `url`, `category: GameApplication`) for `WebApplication` JSON-LD. Content: what it is, how to play (touch controls, Force powers, blocking), planet list tease, share-card screenshot, FAQ ("free? offline? mobile?").
3. **Nav entry** under Apps in `_data/navigation.yml`.
4. **Cross-links**: add Clone Defense to the "More free Star Wars tools" list on all three existing landing pages, and a mention on `about.md`. (Convention says each app page cross-links the others — keep all four in sync.)
5. **Home-page grid**: `grid-cols-3` becomes 4 cards — verify the `md:grid-cols-3` layout still looks right or move to `md:grid-cols-2 xl:grid-cols-4`.
6. Update the sibling-repo table in `CLAUDE.md` when it ships.

## P1 — Conversion loops (make traffic compound)

7. **Follow CTA everywhere.** The "follow us" block currently exists only on the home page. Add a compact follow strip (Threads, BlueSky, Instagram, YouTube icons + one-line hook like "Daily Star Wars from AurebeshFiles") to `_includes/footer.html` and to the blog post footer (`_layouts/posts.html`) and character page footer (`_layouts/character.html` — generated pages inherit it for free, per the "SEO defaults live in the layout" convention). Followers are the campaign's growth goal; this is the highest-leverage single addition.
8. **"Try another app" footer band.** A small four-icon strip in `_includes/footer.html` linking the four landing pages, so every page on the site — including all generated character pages — pitches the portfolio. Directly serves the 2+ apps north-star metric.
9. **GA4 outbound-click events** on the home app cards and landing-page launch links (`gtag('event', 'launch_app', {app: 'timeline'})`) so the campaign dashboard can attribute which surfaces convert.
10. **UTM discipline**: all campaign links into the site carry `utm_source`/`utm_campaign`; internal links never carry UTMs.

## P2 — SEO & content surfaces

11. **`/start-here` page** — "New to Star Wars? Watch in this order" viewing-order guide (chronological vs release vs machete), each era deep-linking into the timeline app with year URLs. Viewing-order queries are evergreen high-volume search; nothing on the site targets them today.
12. **Character index upgrade** (`/character`): group by era/faction, add a search filter box (client-side JS over page titles). 75+ pages deserve better than a flat list.
13. **"Hardest SWordle words" page** — hall-of-fame page under the editable intro section of the SWordle ecosystem (new hub page, *not* the generated `swordle-word-list.md`). Feeds Arc 3; targets "star wars wordle answers" queries without giving away today's word.
14. **FAQ blocks + `FAQPage` JSON-LD** on the three (soon four) app landing pages. `structured-data.html` already branches on `page.app`; extend it to emit FAQ schema from an optional `faq:` front-matter list.
15. **Blog cadence**: 3 posts/month minimum (dev-log, character spotlight, app update). Every social series in the playbook gets a canonical blog post first — social links to the post, post links to the app.
16. **OG image audit**: every page needs a real `social-image`; character pages currently inherit whatever the generator emits. If gaps exist, fix in `starwars-timeline/build_scripts/website.js` (per the existing learning about generator-side fixes), not by hand-editing generated files.

## P3 — Nice-to-have polish

17. **"As seen on" / press page** once any podcast or blog coverage lands (Arc: press outreach).
18. **May the 4th landing page** (`/may-the-4th`) — build in Q1 2027, one page aggregating all four apps' event-day content; the URL earns links year after year.
19. **Announcement banner include** — a dismissible one-line banner in `_includes/head.html`-adjacent layout space for launch weeks ("NEW: Clone Defense is live →"). Reusable for every future launch.
20. **`/press` kit page** — one-paragraph brand blurb, app screenshots, card art, the fan-project disclaimer, contact link. Makes podcast/blog outreach one URL instead of an attachment zip.

## Explicitly out of scope

- No paid advertising pages or tracking pixels beyond existing GA4/AdSense.
- No hand-edits to generated content (`character/*.md`, `swordle-word-list.md` below the anchor) — generator changes go in their source repos.
- No re-adding GitHub Pages (deleted 2026-07-19 for duplicate-content reasons).
