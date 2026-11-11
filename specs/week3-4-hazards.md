# Week 3–4: Hazard system (static, triggered, roaming, timed)

Build plan: DESIGN.md section 10, Week 3–4. Status: **awaiting owner approval**.
Three choices are open (see "Options for the owner"); the spec is written with
the recommended option for each. The level file changes below are a
**proposal**: they are made only after you approve.

## In plain words
Level 1 gets its first three hazards, drawn as coloured squares: bumpy
cobbles on the path, a chatty neighbour beside the path, and the church bells.
Each one behaves by its type. The cobbles are always there. The neighbour gets
a pulsing red ring as the stroller comes near, "goes off" (grows, solid ring)
while the stroller is close, then fades once it has passed. The bells warn
with a pulsing ring, ring for 4 seconds at a fixed time, then fade. The level 3
test map gets a pigeon swarm that walks back and forth across the path.
Nothing can be done about hazards yet, and they don't affect the baby: the
stroller walks straight through them. Items come in Week 4, the wake meter in
Week 5.

## Goal
As the player, I can see every hazard on the map and tell from its look when
it is quiet, about to go off, going off, or finished.

## In scope
- The 4 hazard types and their states, as pure logic.
- An optional `"hazards"` list in level files, with checks.
- Three level-1 hazards (cobbles, chatty neighbour, church bells) and one
  roaming pigeon swarm on the level-3 test map.
- Drawing hazards as placeholder squares with a warning ring.

## Out of scope
- Item tray, drag and drop, item counts, right/wrong matches (Week 4).
- Wake meter, "missed hazard" effects, baby states, fail and restart (Week 5).
  This spec does not decide how far a hazard "reaches" the stroller.
- The Vespa (4th level-1 hazard): added with Week 6, when level 1 is finished.
- Hazard icons above hazards, sounds, real art (Week 11).
- Hazards that change the map (level 8, Later). Sign/hazard interactions.
- TODO leftovers (`ERROR_ORIGIN` rename, `cols`/`rows` checks).

## Options for the owner
**1. How you see a roaming hazard this week (level 1 has none in DESIGN.md)**
- **A (recommended): one pigeon swarm on the level-3 test map** (`?level=3`).
  Pigeons are a level-3 hazard in DESIGN.md, and level 3 has the wait sign,
  which exists so roaming hazards can pass. Level 1 stays "one new thing".
- B: make level 1's Vespa a roaming hazard. Visible on the main link, but
  level 1 then shows 4 hazards and a second idea (moving hazards) too early.
- C: roaming only as tested logic, nothing on screen until Week 8. Smallest,
  but you can't check it yourself.

**2. How the chatty neighbour (triggered) warns you**
- **A (recommended): ring starts pulsing when the stroller is 4 tiles away,
  goes off at 2 tiles, stops once the stroller is more than 2 tiles away again.**
  Matches "goes off within 2 tiles" and gives about 2 seconds of warning at 1x.
- B: goes off at 2 tiles for a fixed 4 seconds. Can end before the stroller
  has passed, which looks odd.
- C: no warning at all. Simplest, but DESIGN.md asks for a warning ring.

**3. Which clock the church bells use**
- **A (recommended): the walk clock** — starts at 0 when you tap to start,
  stops when paused, runs twice as fast at 2x. Same clock as the wait sign.
- B: real time since the level opened. Bells could ring before you start and
  ignore pause, which is stressful.

## Words used
- **Hazard type:** how it behaves: `static`, `triggered`, `timed`, `roaming`.
- **Hazard kind:** what it is: `cobbles`, `neighbour`, `bells`, `pigeons`.
  Each kind has exactly one type (table below).
- **Hazard state:** `idle` (quiet), `warning` (about to go off), `active`
  (going off, or simply there), `done` (finished for this walk).
- **Tile distance:** the larger of the column gap and the row gap
  (a square ring around a tile). Positions may be between tiles.
- **Stroller point:** `pointOnPath(path, distance)` from Week 2.
- **Walk clock (`walkMs`):** ms of walking since the tap to start, already
  multiplied by the speed (1x/2x), not counting paused time. It keeps running
  while the parent stands at a wait sign.

## Hazard types and level-1 hazards
| Type | Behaviour | States |
|---|---|---|
| static | Always there on a path tile | always `active` |
| triggered | Reacts to the stroller's distance | `idle` → `warning` at ≤ `TRIGGER_WARNING_RADIUS_TILES` → `active` at ≤ `TRIGGER_RADIUS_TILES` → `done` once farther than `TRIGGER_RADIUS_TILES` again. Can skip `warning`. Never goes back. |
| timed | Goes off at `atMs` on the walk clock | `idle` before `atMs − HAZARD_WARNING_MS`, `warning` until `atMs`, `active` for `TIMED_ACTIVE_MS`, then `done` |
| roaming | Walks back and forth along its route at `ROAM_SPEED` | always `active`; position changes |

| Kind | Type | Where | Correct item (used from Week 4) | Placeholder look |
|---|---|---|---|---|
| cobbles | static | plain path tile | Plank | dark grey-brown square (rough patch) |
| neighbour | triggered | grass beside the path | "Shh" card | lilac square (a person) |
| bells | timed | grass (church) | White-noise speaker | gold square (a bell) |
| pigeons | roaming | route of tiles | Breadcrumbs | blue-grey square |

## Level files
New optional field `"hazards"`: a list. Missing means no hazards.
- Every hazard: `"id"` (text, unique in the level), `"kind"` (a key of
  `HAZARD_KINDS`).
- static, triggered, timed: `"col"`, `"row"` (whole numbers inside the grid).
- timed also: `"atMs"` (whole number, 0 or more).
- roaming: `"route"` instead of col/row: a list of at least 2
  `{ "col", "row" }` tiles inside the grid, each one step up, down, left or
  right from the one before. It starts on the first tile.

Checks in `validateLevel` (each failure is a plain-English problem):
1. `"hazards"` present but not a list.
2. Missing or repeated `id`; unknown `kind`.
3. col/row missing, not whole numbers, or outside the grid.
4. static not on a plain path tile (start, finish and grass are not allowed).
5. triggered or timed not on a grass tile.
6. triggered with no walkable tile within `TRIGGER_RADIUS_TILES` (it could
   never go off).
7. timed with missing, negative or non-whole `atMs`.
8. roaming route missing, shorter than 2, a tile outside the grid, or a step
   that isn't exactly one tile up/down/left/right.
9. Two non-roaming hazards on the same tile.

`parseLevel` passes the list through as `hazards` (empty list if missing).

### Proposal: `levels/level-01.json` (add after approval)
```json
"hazards": [
  { "id": "bells-1", "kind": "bells", "col": 5, "row": 3, "atMs": 5000 },
  { "id": "neighbour-1", "kind": "neighbour", "col": 9, "row": 7 },
  { "id": "cobbles-1", "kind": "cobbles", "col": 13, "row": 4 }
]
```
The church sits inside the first loop; the neighbour stands below the bottom
stretch; the cobbles are three tiles before the bench. Timeline at 1x (the walk
takes 23 s): bells warn 2.5–5 s, ring 5–9 s; neighbour warns from 10 s (stroller
at (7,3)), goes off at 12 s ((7,5)), done after 18 s ((11,5)); stroller rolls
over the cobbles at about 21 s. One thing at a time, nothing overlaps.

### Proposal: `levels/level-03.json` (add after approval)
```json
"hazards": [
  { "id": "pigeons-1", "kind": "pigeons",
    "route": [ { "col": 8, "row": 3 }, { "col": 8, "row": 4 },
               { "col": 8, "row": 5 }, { "col": 8, "row": 6 } ] }
]
```
The pigeons cross the straight path at (8,5), going down and back up every
6 s. With no signs the stroller reaches (8,5) at 8 s, exactly when the pigeons
are on it.

## Controls and states
- No new controls. Hazards can't be tapped this week; taps on a hazard tile
  behave exactly as before (outline, start walk, place sign).
- Game states stay `ready`, `walking`, `paused`, `won` (plus level error).
- `ready`: hazards show their starting state (cobbles and pigeons visible,
  neighbour and bells `idle`). Pigeons stand on their first tile.
- `walking`: hazard states and pigeon positions update every frame.
- `paused` and `won`: hazard states and positions freeze. (The warning ring may
  keep pulsing; that's only the animation.)

How each state is drawn (square `HAZARD_SIZE`, kind colour, centred on its
tile or roaming position):
| State | Look |
|---|---|
| idle | square only |
| warning | square + ring (`HAZARD_RING_COLOUR`, radius `HAZARD_RING_RADIUS`) pulsing between scale 1 and `WARNING_PULSE_SCALE` every `WARNING_PULSE_MS` |
| active, triggered or timed | square at `HAZARD_ACTIVE_SCALE` + solid ring |
| active, static or roaming | square only (they're always "on") |
| done | square at `HAZARD_DONE_ALPHA` |

Draw order, bottom to top: tiles, **hazards**, green outlines, signs, tap
outline, parent and stroller, buttons, texts.

## Start, end and fail conditions
- Start, win, pause and 2x speed: unchanged.
- Hazards never stop, slow or end the walk this week. No fail.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `HAZARD_TYPES` | `['static', 'triggered', 'timed', 'roaming']` | Allowed types |
| `HAZARD_KINDS` | `{ cobbles: { type: 'static', colour: 0x6b6259 }, neighbour: { type: 'triggered', colour: 0xb48ad6 }, bells: { type: 'timed', colour: 0xd9a521 }, pigeons: { type: 'roaming', colour: 0x8a94a6 } }` | Kind → type and placeholder colour |
| `HAZARD_WARNING_MS` | 2500 | Timed hazards warn this long before `atMs` |
| `TIMED_ACTIVE_MS` | 4000 | How long a timed hazard goes off |
| `TRIGGER_RADIUS_TILES` | 2 | Triggered hazard goes off within this tile distance |
| `TRIGGER_WARNING_RADIUS_TILES` | 4 | Triggered hazard warns within this tile distance |
| `ROAM_SPEED` | 1 | Roaming hazards, tiles per second (walk clock) |
| `HAZARD_SIZE` | 44 | Hazard square, pixels |
| `HAZARD_ACTIVE_SCALE` | 1.3 | Size when going off |
| `HAZARD_DONE_ALPHA` | 0.35 | Faded look when done |
| `HAZARD_RING_COLOUR` | `0xd9483b` | Warning / going-off ring, warm red |
| `HAZARD_RING_RADIUS` | 30 | Ring radius, pixels |
| `HAZARD_RING_WIDTH` | 4 | Ring line thickness, pixels |
| `WARNING_PULSE_MS` | 400 | Half a pulse (grow or shrink) |
| `WARNING_PULSE_SCALE` | 1.25 | Biggest ring size while pulsing |
| `DEPTH_HAZARDS` | 0.5 | Between tiles (0) and green outlines (1) |

## Logic (src/logic/hazards.js, pure, no Phaser)
`tuning` is `{ warningMs, timedActiveMs, triggerRadius, warningRadius, roamSpeed }`
filled from the config values above. No function changes its inputs.

- `tileDistance(a, b) → number` — `max(|a.col − b.col|, |a.row − b.row|)`.
- `timedState(atMs, walkMs, warningMs, activeMs) → state` — as in the type table.
- `nextTriggeredState(prev, distance, warningRadius, triggerRadius) → state` —
  `idle`: → `active` if `distance ≤ triggerRadius`, else → `warning` if
  `distance ≤ warningRadius`, else stays. `warning`: → `active` if
  `≤ triggerRadius`, else stays. `active`: → `done` if `> triggerRadius`, else
  stays. `done` stays.
- `roamPosition(route, walkMs, speed) → { col, row }` — steps =
  `walkMs / 1000 × speed`; one round trip is `2 × (route.length − 1)` steps;
  the swarm goes first → last → first and repeats, moving smoothly between
  tiles.
- `updateHazards(hazards, kinds, prev, walkMs, stroller, tuning) → list` —
  one `{ id, state, col, row }` per hazard, in the same order. `prev` is the
  previous list (or `null` = every triggered hazard starts `idle`). `stroller`
  is the stroller point. static: `active` at its tile. timed: `timedState`.
  triggered: `nextTriggeredState` with `tileDistance(stroller, hazard)`.
  roaming: `active` at `roamPosition`.

Also: `validateLevel` gets the checks above; `parseLevel` adds `hazards`.

## Acceptance criteria
`L1`/`L3` are the parsed level files after the proposed change; `T` is the
tuning object from the config values.

1. `npm test` passes; `npm run build` succeeds with no errors.
2. All Week 1–2, Week 2 and Week 3 criteria still pass; `findPath(L1)` is the
   same 24 tiles.
3. `tileDistance({col: 7, row: 3}, {col: 9, row: 7})` → 4;
   `({col: 7, row: 4.5}, {col: 9, row: 7})` → 2.5; same tile → 0.
4. `timedState(5000, t, 2500, 4000)`: t = 0 and 2499 → `idle`; 2500 and 4999 →
   `warning`; 5000 and 8999 → `active`; 9000 and 20000 → `done`.
5. `nextTriggeredState(s, d, 4, 2)`: (`idle`, 5) → `idle`; (`idle`, 4) →
   `warning`; (`idle`, 1.5) → `active`; (`warning`, 3) → `warning`;
   (`warning`, 2) → `active`; (`active`, 2) → `active`; (`active`, 2.5) →
   `done`; (`done`, 0) → `done`.
6. `roamPosition` with route (8,3), (8,4), (8,5), (8,6) and speed 1:
   0 → (8,3); 1500 → (8, 4.5); 3000 → (8,6); 4000 → (8,5); 6000 → (8,3);
   7500 → (8, 4.5); 8000 → (8,5).
7. Level 1 neighbour, using `updateHazards` frame by frame with the stroller at
   `pointOnPath(findPath(L1), d)`: state is `idle` at d = 9.5, `warning` at
   d = 10 and 11.5, `active` at d = 12, 15 and 18, `done` at 18.5 and 23.
8. `updateHazards` on `L1` with `prev = null`, `walkMs = 0`, stroller at the
   start → cobbles `active` at (13,4), neighbour `idle`, bells `idle`. With
   `walkMs = 6000` bells are `active`; with `10000`, `done`.
9. `updateHazards` on `L3` with `walkMs = 8000` → pigeons `active` at (8,5).
10. `updateHazards`, `roamPosition` and `parseLevel` don't change their inputs.
11. `validateLevel` gives no problems for level 1 and level 3, and for a level
    with no `"hazards"`. `parseLevel` gives `hazards: []` when missing.
12. `validateLevel` reports a problem (one test each) for: `"hazards": {}`;
    a missing `id`; two hazards with id `"a"`; kind `"vespa"`; cobbles at
    (0,4) (start), (0,0) (grass) or (16,4) (outside); col `1.5`; neighbour on
    (5,2) (path); neighbour at (0,0) on level 1 (no path within 2); bells
    without `atMs`, with `-1` or `2.5`; pigeons with a 1-tile route, a route
    tile at (8,9), or a step from (8,3) to (8,5); two cobbles hazards both
    at (13,4).
13. The normal link shows level 1 with a dark grey-brown square on (13,4), a
    lilac square on (9,7) and a gold square on (5,3), all `HAZARD_SIZE`, below
    the stroller. Nothing pulses before the tap to start.
14. On level 1 at 1x: the bells ring pulses from about 2.5 s, the gold square
    grows with a solid ring from 5 s to 9 s, then fades. The neighbour's ring
    pulses as the stroller comes down the right side of the first loop, the
    square grows while the stroller passes below it, and it fades once the
    stroller turns up toward the bench. The stroller rolls over the cobbles
    without stopping. At 2x all of this happens twice as fast.
15. Pausing freezes every hazard state and the pigeons' position; resuming
    carries on from the same moment. After the win, nothing changes any more.
16. `?level=3` shows a blue-grey square on (8,3). After the tap to start it
    walks smoothly down to (8,6) and back up, one round trip every 6 s at 1x,
    and keeps going while the parent stands at a wait sign.
17. Taps on hazard tiles behave as before (outline, start, place a sign).
18. Every new number, colour and text in scene files comes from
    `src/config.js` or the level file (the "no raw numbers other than 0, 1, 2"
    test covers new files). `src/logic/` does not import Phaser.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ sideways. You see three new
   squares: gold inside the first loop (church), lilac below the bottom
   stretch (neighbour), dark grey-brown on the path just before the bench
   (cobbles). Nothing pulses yet.
3. Tap to start. After about 2 seconds a red ring pulses round the gold square;
   at about 5 s it gets bigger with a solid ring for about 4 s, then fades.
4. As the stroller comes down the right side of the loop, the lilac square gets
   a pulsing ring, then grows while the stroller passes below it, then fades
   when the stroller heads up to the bench.
5. The stroller rolls over the dark square without stopping and reaches the bench.
6. Reload, start, and tap **II** while a ring is pulsing: nothing moves on.
   Tap again: it carries on. Try **2x**: everything happens twice as fast.
7. Open https://pinzzas.github.io/Stroller-God/?level=3 and tap to start. A
   blue-grey square walks down across the path and back up, again and again.
   Put a wait sign just before it: the pigeons keep walking while the parent waits.

## Assumptions (owner, please correct if wrong)
- Choices 1A, 2A and 3A above.
- Level 1 gets one cobbles tile, one neighbour and one bells hazard this week;
  Week 6 adds the Vespa and tunes positions and counts.
- Cobbles and pigeons are "always on" and never finish; only triggered and
  timed hazards warn and fade.
- Hazards go off and fade even though they don't affect anything yet; the
  wake meter (Week 5) will decide what "missed" means.
- A hazard square can share a tile with a sign; the sign is drawn on top.
- The ring and squares are placeholders: the colours roughly hint at the
  item (rough patch → plank, person → "Shh", bell → speaker), the real
  "guess it without text" look comes with the Week 11 art.
