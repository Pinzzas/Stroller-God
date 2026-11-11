# Stroller God Game – Design Doc

Nov 10, 2026 · Roxi Biribicchi

## Pitch
You are an unseen guardian angel watching over a tired parent pushing a sleeping baby through Swiss and European life. The parent walks on their own; you drop items and signs from above to stop every bump and noise before it reaches the stroller.

- **Inspirations:** Unrailed (grid map, constant forward pressure) and Lemmings (indirect control through signs).
- **Tone:** cozy and funny, getting absurd in later levels — from old-town cobblestones to a haunted Black Forest at night.
- **Platform:** PC on Steam first; touch controls make a later mobile version easy.
- **Relation to other projects:** a separate game from the 2D side-scroller.
- **Open question:** working title.

## Core loop
The parent never stops walking, so every level is a race to fix the route ahead of the stroller.

1. **Preview:** the camera shows the whole map, the start (e.g. home) and the finish (e.g. the park bench).
2. **Walk:** the parent starts pushing at a steady pace along the path.
3. **Spot:** hazards sit on the map or pop up with a warning icon 2–3 seconds before they go off.
4. **Fix:** drag the right item from the tray onto the hazard before the stroller gets there.
5. **Steer:** place signs at junctions to send the parent down a calmer or shorter path.
6. **Arrive:** reach the finish with the baby still asleep to earn stars and upgrades.

### Hazard behaviours
- **Static:** always there, like a pothole. Pure planning.
- **Triggered:** goes off when the stroller comes within 2 tiles, like a barking dog.
- **Roaming:** moves around the map, like a pigeon swarm or a goat herd.
- **Timed:** goes off at a fixed moment, like church bells on the hour.

## Controls
One gesture does almost everything: drag from the tray, drop on a tile.

| Action | Mouse (PC) | Touch (later) |
|---|---|---|
| Place item or sign | Drag from tray to tile | Drag with finger |
| Pick an item back up | Right-click it | Long-press it |
| Rotate a sign | Scroll wheel or R | Tap it |
| Pause | Space | Pause button |
| Speed up | F (1x / 2x) | Fast-forward button |

- **Camera:** fixed top-down view; in the MVP every level fits on one screen, so there is no scrolling.
- **Grid:** tiles light up green where the held item fits and red where it does not.
- **Pausing:** you can place, move and pick up items and signs while the game is paused, so players can plan calmly.

## Items & signs
Each hazard has exactly one correct item; a wrong item is wasted and makes a small noise.

### Items

| Hazard | First level | Correct item | Effect |
|---|---|---|---|
| Pothole, cobblestones | 1 | Plank | Smooths 1 tile |
| Church bells, Vespa | 1 | White-noise speaker | Muffles sound in a 2-tile radius |
| Chatty neighbour | 1 | "Shh" card | Neighbour whispers instead |
| Tram bell, train announcement | 3 | White-noise speaker | As above |
| Pigeon swarm | 3 | Breadcrumbs | Lures pigeons away; place off the path |
| Wet floor, puddle | 2 | Towel | Dries 1 tile |
| Cowbells, goat herd | 4 | Hay bale | Lures animals away from the path |
| Alphorn player | 4 | Coin | Player takes a break |
| Guggenmusik band, techno float | 5 | Earmuffs (for baby) | Blocks one loud event |
| Owls, whispering ghosts | 7 | Lantern | Light keeps ghosts away and shows the path |
| Wolves | 7 | Cervelat sausage | Lures wolves away |
| Avalanche rumble, yodelling yeti | 8 | Snow wall | Blocks sound from one side |

### Signs

| Sign | What the parent does |
|---|---|
| Arrow | Turns at that junction, e.g. onto a shortcut |
| Wait | Stops for 3 seconds so a roaming hazard can pass |
| Lantern (night levels) | Can only walk on lit tiles; no lantern ahead means the parent stops |

- **Supply:** each level gives a fixed count per item, e.g. 3 planks and 1 speaker. Signs can be picked up and reused.
- **Rule for new items:** every new item must have a clear, funny visual, so players guess its use without text.

## Wake meter & scoring
The wake meter runs from 0 to 100; at 100 the baby wakes and the level restarts.

| Event | Wake meter |
|---|---|
| Small hazard missed (bump, pigeon) | +15 |
| Medium hazard missed (dog, tram bell) | +30 |
| Big hazard missed (band, yeti) | +50 |
| Wrong item placed | +10 |
| Calm walking | −2 per second |

### Baby states (the player reads these at a glance)
- **0–49, deep sleep:** slow breathing, little "zzz" bubbles.
- **50–79, stirring:** wiggles, sighs, the music gets quieter.
- **80–99, about to wake:** eyelids flutter, a heartbeat sound plays.

### Stars per level
- **1 star:** reach the finish.
- **2 stars:** the meter never goes above 50.
- **3 stars:** 2 stars plus at least 1 item left over.

Levels last 2–4 minutes, so a restart never hurts much.

## Levels
Eight levels run from everyday Swiss life to Alpine legends, and each one teaches exactly one new thing.

| # | Setting | Tier | New thing taught | Hazards | MVP |
|---|---|---|---|---|---|
| 1 | Old-town cobblestones | Relatable | Drag and drop items | Cobbles, church bells, Vespa, chatty neighbour | Yes |
| 2 | Saturday supermarket rush | Relatable | Roaming hazards | Trolleys, beeping checkouts, wet floor | Later |
| 3 | Main station & trams | Relatable | Arrow and wait signs | Tram bells, announcements, pigeons | Yes |
| 4 | Alpine pasture | Weird | Lure items placed off the path | Cowbells, alphorn, goat herd | Yes |
| 5 | Fasnacht | Weird | Big timed events | Guggenmusik, confetti cannons, masked crowds | Later |
| 6 | Street Parade | Weird | Several hazards at once | Techno floats, whistles, dancing crowds | Later |
| 7 | Haunted Black Forest at night | Extreme | Darkness and lanterns | Owls, wolves, whispering ghosts, crunchy leaves | Yes |
| 8 | Avalanche pass | Extreme | Hazards that change the map | Rumbling snow, ice cracks, yodelling yeti | Later |

- **Pacing:** each level ends with a short, funny moment, e.g. the parent collapses on the park bench while the baby keeps snoring.
- **Map size:** about 16 × 9 tiles, so one level fits a laptop or phone screen.

## Progression
Stars unlock the next level and pay for stroller upgrades, so replaying for 3 stars has a reward.

| Upgrade | Cost (stars) | Effect | MVP |
|---|---|---|---|
| Soft suspension | 2 | Bumps add half as much to the wake meter | Yes |
| Canopy | 4 | Light and glare hazards no longer count | Later |
| Noise-cancelling hood | 4 | All sound hazards add 25% less | Yes |
| Bigger basket | 4 | +1 of every item per level | Yes |
| Coffee cup holder | 6 | Parent walks 10% slower, giving you more time | Later |
| Off-road wheels | 8 | Opens gravel shortcuts in the pasture and forest levels | Later |

- **Look:** every upgrade changes the stroller's look, so progress is visible on screen.
- **Max stars:** 8 levels × 3 stars = 24; all upgrades cost 28 in total, so players choose which ones they want most. In the MVP (4 levels, 12 stars) the 3 MVP upgrades cost 10, so all of them are reachable.

## Art & sound
The look is a warm, slice-of-life anime style seen from above, with Swiss details players recognise.

### Visual rules
- **Readability first:** every hazard gets an icon above it and a pulsing ring 2–3 seconds before it goes off.
- **Swiss details:** blue-and-white trams, fountains, red flags, flower boxes, snowy Alps on the edges of the map.
- **Characters:** the parent and baby are the heroes and get the most expressive animations, like a yawning parent or a snoring baby.
- **Night levels:** dark blue overlay with warm lantern light.

### Getting the art
1. Build with placeholder shapes until the game is fun.
2. Swap in a top-down anime-style asset pack (e.g. from itch.io; check the licence allows commercial use) for tiles and props.
3. Commission an artist for the parent, baby and stroller so the heroes look unique.

If any art is AI-generated, Steam asks you to disclose it when you submit the game.

### Sound
- A soft lullaby theme that slows down and quiets as the baby stirs.
- Each hazard has a distinct, cartoonish sound, so players learn them by ear.
- Baby sounds (sighs, whimpers) work as an audio warning for the wake meter.

## MVP scope
The MVP is 4 playable levels with the full core loop, built in about 72 hours (12 weeks × 6 hours).

| Area | In the MVP | Later |
|---|---|---|
| Levels | 1, 3, 4, 7 | 2, 5, 6, 8 |
| Items | Plank, speaker, "Shh" card, breadcrumbs, hay bale, coin, lantern, cervelat | Towel, earmuffs, snow wall |
| Signs | Arrow, wait, lantern | More if playtests ask for them |
| Upgrades | Suspension, hood, basket | Canopy, coffee holder, off-road wheels |
| Platform | Browser build, played on PC and phone | Steam desktop build, mobile app |
| Art | Asset pack + placeholder heroes | Commissioned hero art, cutscenes |

- **Done means:** a friend can play all 4 levels without help and wants to replay one for 3 stars.
- **Assumption:** same 3-month, 6-hours-a-week budget as the side-scroller; running both at once halves the speed of each.

## Build plan for Claude Code
Recommended setup: Phaser 3 + plain JavaScript (same as the side-scroller) in a new GitHub repo, auto-published to GitHub Pages so you can play every change in your phone's browser.

### Why this stack
- It needs no desktop editor, which fits working only from the Claude web and iOS apps.
- Levels live as small JSON grid files that agents can create and edit easily.
- A browser game can later be wrapped as a Steam desktop build (e.g. with Electron).

### Tasks in order (one task per Claude Code session; after each one, play the GitHub Pages link)
- **Week 1:** Create the files from the project setup doc (CLAUDE.md + 6 subagents), then set up Phaser, Vite and auto-deploy to GitHub Pages.
- **Week 1–2:** Grid map loaded from a level JSON file, drawn with coloured squares.
- **Week 2:** Parent and stroller walk the path at a steady speed; reaching the finish wins.
- **Week 3:** Arrow and wait signs at junctions.
- **Week 3–4:** Hazard system (static, triggered, roaming, timed) with 3 hazards from level 1.
- **Week 4:** Item tray with drag and drop, item counts, right and wrong matches.
- **Week 5:** Wake meter, baby states, fail and restart.
- **Week 6:** Level 1 playable start to finish; first playtest.
- **Week 7:** Stars, level select, saved progress.
- **Week 8:** Levels 3 and 4 with their new hazards.
- **Week 9:** Level 7 with darkness and lanterns.
- **Week 10:** Upgrade shop with 3 upgrades.
- **Week 11:** Art pass with the asset pack, plus music and sounds.
- **Week 12:** Polish, playtest with friends, fix bugs.

### How to brief an agent
- Give it one task from the list, and point it to the matching section of this doc.
- Ask it to finish with a short "how to test this" note you can follow on your phone.
- Ask a second agent to review the work before you merge it.
