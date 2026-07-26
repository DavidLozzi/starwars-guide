# Clone Defense — Launch Plan

*Target: late July 2026 (game ships "in a few days" as of 2026-07-21). This is the campaign's Arc 1 and the quarter's traffic spike.*

## The pitch

**One Jedi. Fifteen planets. An endless clone assault ending at Order 66. How long can you hold the line?**

Selling points, in order of punch:
1. Free browser game, no install, no account, plays great on your phone.
2. Blocking is the skill — you physically throw the Jedi around to intercept blaster bolts; Force powers are the comeback layer.
3. 15 planets of the Clone Wars, each with its own look and escalating droids, 10 waves each.
4. There is no winning. Your clones are your life bar. It ends the way the Clone Wars ended.
5. Built from scratch with zero dependencies — the dev story is a second audience (HN, r/SideProject).

## Pre-launch (now → ship day)

- [x] **Owner decision:** subdirectory-of-hub deploy confirmed (2026-07-21) — game ships at `starwars.guide/clone-defense/`.
- [ ] Complete site-updates.md P0 items (card, landing page, nav, cross-links, CLAUDE.md table) on a branch, ready to merge on ship day.
- [ ] Capture assets: 60–90s gameplay trailer (vertical + landscape cuts), 6 planet screenshots, one share-card image, card art for `assets/cards/` (compress before commit — ffmpeg, no webp on this machine).
- [ ] Verify the in-game share card renders a starwars.guide URL — it's the whole organic loop.
- [ ] Write launch blog post in `_posts/`: the story ("I built a Star Wars tower defense with zero dependencies"), how to play, planet tease. Canonical link target for all social.
- [ ] Draft all launch-day posts (below) so ship day is copy-paste.
- [ ] Teaser posts T-2 and T-1 days: cropped screenshot, "something is coming to starwars.guide," planet-silhouette poll.

## Launch day

Morning, in order:
1. Merge site P0 branch; verify live (`bundle exec jekyll build` locally first; check the 4-card grid on mobile).
2. Blog post live; announcement banner on (if built).
3. Social volley — stagger 30–60 min apart, all links UTM-tagged `utm_campaign=clone-defense-launch`:
   - **Threads/BlueSky:** trailer clip + "It's live. One Jedi vs. the Separatist army. Free, no install, works on your phone. How long can you last?" + link.
   - **Instagram:** Reel (vertical trailer) + Stories with link sticker.
   - **YouTube:** Short (vertical trailer); full trailer as regular upload if a landscape cut exists.
   - **X:** mirror.
4. **Reddit r/WebGames** "I made a Star Wars tower-defense you play in the browser" — the one same-day link post. Answer every comment.

Evening: personal high-score post with share card — "Day one. Geonosis, wave 7, 14,200. Beat it." Kicks off the score-challenge loop.

## Launch week (D+1 → D+7)

- D+1: **Show HN / r/SideProject** — dev-story angle, links to blog post not the game directly. Different audience, different day, no crossfire with r/WebGames.
- D+2: "How blocking works" explainer clip (the core-verb mechanic is genuinely novel — show it).
- D+3: Planet showcase carousel (6 screenshots, IG + Threads).
- D+4: Repost best player scores/share cards found in the wild; start weekly "beat this score" ritual (Saturday slot in the playbook takes over from here).
- D+5–7: Press/podcast emails go out — "one developer, four free Star Wars tools" portfolio angle with Clone Defense as the news hook. Target ten fan outlets/podcasts, personal notes each.

## Measurement (day 7 review)

- Game sessions (GA4 on hub if subdirectory deploy — confirm analytics reaches the game pages).
- Hub sessions vs. prior week; % of game visitors clicking through to another app (the footer band / cross-links earn their keep here).
- Share cards spotted in the wild; Reddit/HN post performance; follower/subscriber growth per platform during launch week (screenshot counts on D0 and D+7).
- Decide by D+7: does Clone Defense get the Saturday clip slot permanently, or taper to biweekly.

## Risks

- **IP visibility spike.** A front-page HN/Reddit hit invites attention. Disclaimer on the landing page and in every post; non-commercial posture throughout; comply immediately if contacted.
- **Launch slip.** Everything above is date-relative, not calendar-fixed — slide the whole plan, never ship the campaign before the game.
- **Mobile jank on real devices.** Test the live URL on actual iOS + Android hardware before the social volley, not after.
