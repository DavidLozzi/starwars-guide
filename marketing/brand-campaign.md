# Brand Campaign Strategy — "Four Tools. One Galaxy."

*AurebeshFiles / starwars.guide — drafted 2026-07-21*

## 1. Positioning

**AurebeshFiles is the indie workshop of Star Wars fandom** — free, fast, no-login tools that make being a Star Wars fan more fun every single day.

- **Timeline** = the reference. "Settle any canon argument."
- **SWordle** = the daily habit. "Your first Star Wars decision of the day."
- **HyperPanels** = the social currency. "Answer anything with a comic panel."
- **Clone Defense** = the adrenaline. "How long can one Jedi last?"

One-line brand promise: **"Free Star Wars tools, built by fans, for fans — no ads in your face, no account required."**

Tagline candidates (pick one, use everywhere):
1. **Four tools. One galaxy.**
2. Built by fans. Powered by the Force.
3. Your daily dose of a galaxy far, far away.

## 2. Audiences

| Segment | Where they live | Which app hooks them first |
|---|---|---|
| Lore nerds / canon-argument settlers | Reddit (r/StarWars, r/MawInstallation), YouTube comments | Timeline, character pages |
| Daily-puzzle players (Wordle diaspora) | Threads, BlueSky, group chats | SWordle |
| Meme & reaction-image posters | Instagram, Discord servers, iMessage | HyperPanels (+ iOS keyboard when it ships) |
| Casual mobile gamers | TikTok/Reels/Shorts gameplay clips | Clone Defense |
| Parents introducing kids to Star Wars | Facebook groups, YouTube | Timeline, Clone Defense |

Each segment enters through one app; the job of the hub and cross-links is to convert them to a second app — and to a follow. **North-star metrics: (1) % of visitors who touch 2+ apps in 30 days, (2) total followers/subscribers across Threads, BlueSky, Instagram, and YouTube.**

## 3. Messaging pillars

1. **Depth you can't Google.** 25 movies/shows and 75+ characters on one interactive timeline; 29,000+ SWordle answers; a searchable comic-panel corpus. Lead with the absurd numbers — they're the proof of love.
2. **Daily rituals.** SWordle every morning, a Clone Defense run at lunch, a HyperPanels reply whenever a group chat needs one. Frame the brand as habits, not visits.
3. **Made by one fan's obsession.** Behind-the-scenes builds well on social — "I taught an AI to read 100,000 comic panels," "I ranked every canon event by year." Builder-story content doubles as dev-community reach (Hacker News, r/webdev, r/SideProject) without spending Star Wars goodwill.
4. **Free means free.** No paywall, no signup, no dark patterns. Say it often; it's rare and it's true.

## 4. Campaign arcs (Q3–Q4 2026)

### Arc 1 — "Hold the Line" (Clone Defense launch, late July)
The launch is the spike; details in [launch-clone-defense.md](launch-clone-defense.md). Everything else in the quarter hangs off the traffic it brings.

### Arc 2 — "Know Your Galaxy" (August, evergreen SEO/social)
Weekly character spotlight: one character page + timeline deep-link + a 30-second vertical video ("Every Ahsoka appearance in canon order — 20 years in 30 seconds"). 6-week series, one character per week, chosen by a poll on Threads/BlueSky the prior Friday. Builds the audience-participation muscle and backlinks to character pages.

### Arc 3 — "SWordle Streak Season" (September)
Lean into streak culture: a monthly leaderboard-style recap post ("September's cruelest word was THRAWN — 41% fail rate" — needs a stats endpoint or manual sampling), shareable streak milestones, and a "hardest words hall of fame" page on the hub. Ask players to post results grids with #SWordle.

### Arc 4 — "Reply With the Force" (October, HyperPanels + keyboard)
If the iOS keyboard is App-Store-ready, this is its window; if not, run it as a HyperPanels web push. Daily "panel of the day" matched to trending conversations. Skit format for Reels/TikTok: real text-message argument, answered entirely in comic panels.

### Always-on
- 3 blog posts/month minimum in `_posts/` (each becomes the "recent posts" feed + social fodder).
- May the 4th 2027 planning starts in Q1 — that's the Super Bowl; every app ships something that day.

## 5. Channels beyond social

- **Reddit (organic, careful):** genuinely useful comments in canon-timeline threads linking a specific timeline year URL — not blasts. r/StarWars, r/MawInstallation, r/PrequelMemes (HyperPanels panels), r/incremental_games + r/WebGames (Clone Defense), r/SideProject + Hacker News "Show HN" (builder story).
- **Discord:** join 3–5 large Star Wars servers as a genuine member; share tools only where a channel invites it. Longer term: an AurebeshFiles server once there's daily content (SWordle spoiler channel is the seed).
- **Podcast/YouTube outreach:** pitch the Timeline to Star Wars podcasters as a research tool — a free tool they'll mention on air is worth 50 posts. Ten-target list, personal emails, no template blasts.
- **Press/blogs:** pitch fan-site roundups (StarWarsNewsNet, Fantha Tracks style outlets) at Clone Defense launch — "one developer built four free Star Wars tools" is the story, not any single app.

## 6. Measurement

- GA4 already installed; add per-app outbound-click events on the home cards, and UTM-tag every social/blog link (`utm_source=threads|bsky|ig|yt|reddit`, `utm_campaign=arc-name`).
- Weekly dashboard (manual is fine): sessions per app, 2+ app rate, follower/subscriber counts per platform, SWordle shares spotted, Clone Defense runs (has localStorage; add a lightweight counter ping only if owner approves).
- Success in 90 days: 2× hub sessions, +1,000 combined followers/subscribers across platforms, one podcast mention, Clone Defense share cards appearing in the wild organically.

## 7. Risks

- **IP:** all clear signals stay non-commercial; if Lucasfilm ever objects, comply immediately. Never use official logos in campaign art; use our own card art and screenshots of our own apps.
- **Platform dependence:** all growth lives on social platforms; mitigated by being on four of them plus evergreen SEO character pages that keep pulling traffic regardless of algorithms.
- **One-person bandwidth:** every series above is designed to be batchable — record/write a month of content in one sitting. If a series slips, drop the series, never the launch.
