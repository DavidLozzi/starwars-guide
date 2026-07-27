---
title: Clone Defense
layout: page
permalink: /clone-defense/
social-image: "/assets/cards/clone-defense.png"
social-title: Clone Defense
social-desc: One Jedi. Fifteen worlds. An endless droid assault. How long can you hold the line?
date: 2026-07-16 12:00:00
last_modified_at: 2026-07-26 12:00:00
app:
  name: Clone Defense
  url: https://starwars.guide/clone-defense/play/
  category: GameApplication
---

You are the Jedi. A Separatist droid line rains blaster fire on your clone troopers, and the only thing between them is you and your lightsaber. Deflect what you can, spend the Force on what you can't, and push the war across fifteen worlds. It's free, there's nothing to install, and it plays in your phone's browser.

<a href="{{ '/clone-defense/play/' | relative_url }}">Play Clone Defense</a> — free, no sign-up, works on phone and desktop.

<a href="{{ '/clone-defense/play/' | relative_url }}"><img src="{{ 'assets/cards/clone-defense.png' | relative_url }}" alt="Clone Defense" /></a>

## How to play

Drag anywhere on the field to guide the Jedi. On a phone the Jedi rides a little above your finger so your thumb never covers the action. There's no jump button, no attack button — moving *is* the whole control scheme.

Your saber deflects on its own. Any bolt that comes near the blade gets sent back into the droid line, and a returned bolt is what kills droids. So playing well means reading which lane the next bolt is coming down and being standing in it.

A few things worth knowing before your first run:

- **The saber is good, not perfect.** It blocks about 82% of bolts that reach it, and it can only handle four bolts in any 200-millisecond window. Park in front of a big cluster and the overflow starts leaking past you. You have to keep moving.
- **You can't reach the droids.** A dashed line across the field marks how far up the Jedi can go. Everything above it is theirs.
- **Your clones are your life bar.** The Jedi has no health. A wave ends when every droid on it is dead, and a run ends when the last clone falls.
- **Clones don't heal on their own.** Within a world it's pure attrition. Reach the next world and a fresh garrison musters at full strength — surviving *is* the healing.
- **Ten seconds between waves.** Survivors, score, and Force earned are shown; hit Ready to skip the breather.
- **Death sends you back to world one.** No checkpoints. The game remembers your furthest world and best score, not your progress.

## The Force

A gauge across the top fills as you fight, up to 1000. You earn it by:

- Deflecting a bolt — **+1.4**
- Killing a droid with a deflected bolt — **+5**
- Clearing a wave — **+10**, plus **+1.2** for every clone still standing

When a clone dies, the Force recoils: earning stalls for two seconds. Long stretches of losing troopers cost you powers as well as bodies.

The gauge carries across worlds — only dying wipes it. Powers unlock at fixed thresholds and stay unlocked once you've touched that number, so spending never re-locks anything. And each tier you unlock above a power makes that power 5% cheaper, so a late-run Push costs noticeably less than an early one.

## Force powers

Four powers, always unlocked in the same order.

**PUSH** — unlocks at 150 Force, costs 150.
Shoves every droid in a wide radius backward and stuns them for a full ten seconds. It doesn't kill anything; it buys you time. Best used on the cluster that's about to bury one flank.

**BLOCK** — unlocks at 400 Force, costs 300.
Raises a Force wall in front of your clones. It soaks incoming fire until its 30 health is gone, and your clones shoot straight through it. This is the power that saves troopers you were about to lose.

**CRUSH** — unlocks at 600 Force, costs 500.
Kills one droid outright, whatever its health. Save it for the thing you cannot chew through — the spider tanks near the end of the campaign have seventeen health and shrug off deflections all day.

**HEAL** — unlocks at 800 Force, costs 650.
Restores one clone to full and tops up its neighbors by a quarter of their health. It **cannot revive the dead** — heal the wounded before the wave that kills them, not after.

Casting is deliberate: tap the power, the game pauses, drag the selector onto your target, then confirm with GO or back out with CANCEL. Cancelling costs nothing.

## The fifteen worlds

Every world runs ten waves, and every world has its own palette — the terrain, the sky, and even the ceiling line are recolored, so you always know where you are.

1. **Christophsis** — crystalline blue-green over near-black. Plain battle droid lines in the crystal city: the war's opening ground battle.
2. **Tatooine** — sand-gold over rust. The super battle droid arrives over the dunes, and you get your first taste of a bolt that really hurts.
3. **Coruscant** — gold city-glow on slate. A skylane raid: flimsy harassers spray fast and die fast around a heavier core.
4. **Kamino** — rain-white on ocean blue-grey. The cloning spires under siege, and the point where supers stop being a surprise and become furniture.
5. **Ryloth** — burnt ochre canyons. Snipers dig in, and you get your first real triage decision: body-block the marksman, or hold the line.
6. **Naboo** — cream stone over green hills. A swarm across the lake country. Every bolt is cheap and there are hundreds of them.
7. **Felucia** — acid green glow over magenta growth. Commando droids stalk the fungal jungle while snipers work the back line.
8. **Geonosis** — foundry rust and desert tan. The first true tank grinds out of the foundry, soaking your deflections while snipers pick at your flanks.
9. **Mandalore** — cold steel over deep blue. Pressure under the domes: quick sprayers screened by commandos and a drill tank.
10. **Nal Hutta** — sickly olive over mud brown. Hutt swampland, and the campaign's mid-point gear change.
11. **Dathomir** — crimson mist over near-black. Fixed snipers rake the ground while heavy battle droids press forward.
12. **Mortis** — bone-white against a void. The whole war at once in a place that shouldn't have one — all four droid classes on the field together for the first time.
13. **Mon Cala** — teal over deep blue. Few units, all brutal. Every kill is a duel and the tri-droid is the anchor.
14. **Umbara** — cyan glow against total black. Elite fire out of the dark: fast, accurate bolts from every body on the field.
15. **Oba Diah** — dusty stone over cold slate. The finale. Everything at once on the Pyke world.

You get better as the war gets worse. Your deflect accuracy climbs from 47% on Christophsis to 82% on Oba Diah, and the damage a returned bolt does nearly doubles across the same span.

## The droid line

Thirteen droid types across four families. A type's stats never change from world to world — worlds get harder by fielding *tougher types, in greater numbers*.

### Battle droids — cheap, fast, endless

| Droid | Health | Damage | First seen |
|---|---|---|---|
| STAP rider | 1.5 | 0.75 | Kamino |
| B1 battle droid | 2.5 | 1 | Christophsis |
| B1 rocket droid | 4 | 1.5 | Geonosis |
| B1 heavy rocket droid | 5 | 2 | Dathomir |

### Super battle droids — bruisers that take a beating

| Droid | Health | Damage | First seen |
|---|---|---|---|
| B2 super battle droid | 5.6 | 2 | Tatooine |
| BX-series droid commando | 6.9 | 2.2 | Ryloth |
| IG-100 MagnaGuard | 8.1 | 2.5 | Nal Hutta |

### Snipers — few, but they almost never miss

Roughly 90% accurate, with the fastest bolts on the field. These are the ones that punish you for standing still.

| Droid | Health | Damage | First seen |
|---|---|---|---|
| Droideka | 4.4 | 2.5 | Ryloth |
| Droideka Mark II | 5.6 | 3 | Nal Hutta |
| IG-86 sentinel droid | 5.6 | 3 | Felucia |

### Spider droids — tanks

Slowest bolts, hardest hits, and enough health that deflections alone won't do it. This is what Crush is for.

| Droid | Health | Damage | First seen |
|---|---|---|---|
| DSD1 dwarf spider droid | 13.8 | 3 | Ryloth |
| OG-9 homing spider droid | 15 | 3.5 | Mon Cala |
| Octuptarra tri-droid | 17.5 | 4 | Mon Cala |

## Jedi skins

Eleven Jedi to play as, each with their own silhouette, robes, and blade color. Skins are **cosmetic only** — swapping one changes how you look, never how you play.

| Jedi | Saber | Unlock |
|---|---|---|
| Padawan | Blue | Free starter |
| Luminara Unduli | Green | Play your first world |
| Plo Koon | Cyan | Reach world 4 — Kamino |
| Shaak Ti | Blue | Score 40,000 |
| Qui-Gon Jinn | Bright green | Reach world 6 — Naboo |
| Kit Fisto | Green | Score 80,000 |
| Ahsoka Tano | White | Reach world 8 — Geonosis |
| Obi-Wan Kenobi | Pale blue | Reach world 10 — Nal Hutta |
| Anakin Skywalker | Blue | Score 120,000 |
| Mace Windu | Purple | Reach world 12 — Mortis |
| Yoda | Yellow-green | Score 250,000 |

Unlocks are permanent and measured against your best run, so a great attempt that ends badly still counts.

## Reach the fifteenth world

There is no victory screen at the end of Clone Defense.

Clear all ten waves on Oba Diah and the game does something else entirely — something it has been quietly setting up since the first bolt on Christophsis. We're not going to tell you what. This war only ends one way, and the only way to see it is to get there.

Most players won't. Hold the line long enough and you will.

<a href="{{ '/clone-defense/play/' | relative_url }}">Play Clone Defense</a>

*Clone Defense is a free fan-made game. It is not affiliated with, endorsed by, or sponsored by Lucasfilm Ltd. or The Walt Disney Company. Star Wars and all related properties are trademarks of Lucasfilm Ltd.*

## More free Star Wars tools from AurebeshFiles

- <a href="{{ 'star-wars-timeline' | relative_url }}">The Ultimate Star Wars Timeline</a> — an interactive chronology of every canon movie and TV show, with <a href="/character">timeline pages for 80+ characters</a>.
- <a href="{{ 'swordle-star-wars-wordle' | relative_url }}">SWordle</a> — the daily Star Wars word game, with over 29,000 possible answers including AT-AT and R2-D2.
- <a href="{{ 'hyper-panels' | relative_url }}">HyperPanels</a> — search a giant database of Star Wars comic panels and answer any conversation with the Force.
- <a href="{{ 'about' | relative_url }}">About AurebeshFiles</a> — who we are and what else we build.
