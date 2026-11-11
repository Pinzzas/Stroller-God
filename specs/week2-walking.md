# Week 2: Parent and stroller walk the path

Build plan: DESIGN.md section 10, Week 2. Status: waiting for owner approval.

## In plain words
A pink square (the stroller) with a dark blue square just behind it (the
parent) appears on the blue home tile. The words "Tap to start walking" show
at the top. When you tap, they glide along the beige path at a steady pace,
one tile per second. When the stroller reaches the yellow park bench, they
stop and "Made it to the park bench!" appears. That's it: no hazards, no
meter, nothing to lose yet. Level 1 takes about 23 seconds.

## Goal
As the player, I tap once and watch the parent push the stroller along the
whole path to the park bench, and I see that I've won when they arrive.

## In scope
- Pure functions in `src/logic/` that find the route through the level and
  say where the walker is after a given time.
- Drawing the parent and stroller as placeholder squares in `GridScene`
  (or a small helper file it imports) and moving them every frame.
- A "Tap to start walking" hint and a win message.

## Out of scope
- Signs and junctions (Week 3). Level 1 has no junctions.
- Hazards, items, the item tray, drag and drop (Weeks 3–4).
- Wake meter, baby states, fail state, restart button (Week 5).
- Stars, level select, saving progress (Week 7). Nothing is saved; reload the
  page to walk again.
- Pause (Space) and 2x speed (F). They are in DESIGN.md controls but not in
  the build plan yet; suggest they join Week 5 or 6.
- Walking animation, turning to face a direction, sound, the funny end moment
  (Week 11 art pass).
- Changes to `levels/level-01.json`. None are needed.

## Controls and states
| State | Shows | Tap or click does |
|---|---|---|
| `ready` | Map, walker on start, "Tap to start walking" | First tap: hint disappears, state becomes `walking`. This tap does **not** move the outline. |
| `walking` | Walker moving along the path | Outlines the tapped tile, as in Week 1–2. Never changes the walk. |
| `won` | Walker stopped on finish, win message | Outlines the tapped tile. Nothing else. |
| level error | Error text only (unchanged) | Nothing. No walker, no hint. |

Outline during the walk: it keeps working exactly as before (helper for
Week 4 drag and drop). It is drawn **below** the parent and stroller, so it
never hides them. Texts are drawn on top of everything.

## Start, end and fail conditions
- Start: page loads in `ready`; the first tap anywhere on the game starts the walk.
- End (win): the stroller reaches the centre of the finish tile. Both squares
  stop there, the win message appears and stays. No saving, no next level.
- Fail: none this week.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `WALK_SPEED` | 1 | Tiles per second |
| `PARENT_TRAIL_TILES` | 0.5 | How far the parent walks behind the stroller, in tiles |
| `STROLLER_SIZE` | 32 | Stroller square, pixels |
| `STROLLER_COLOUR` | `0xf2a7c3` | Soft pink |
| `PARENT_SIZE` | 24 | Parent square, pixels |
| `PARENT_COLOUR` | `0x4a5a7a` | Dark slate blue |
| `MESSAGE_Y` | 64 | Text centre height: middle of the empty top rows 0–1 |
| `MESSAGE_FONT_SIZE` | `'32px'` | Hint and win text size |
| `MESSAGE_COLOUR` | `'#4a3b2a'` | Warm dark brown |
| `START_HINT_TEXT` | `'Tap to start walking'` | Shown in `ready` |
| `WIN_TEXT` | `'Made it to the park bench!'` | Shown in `won` |

Why 1 tile per second: DESIGN.md says triggered hazards go off within 2 tiles
and warnings show 2–3 seconds ahead. At 1 tile/s, 2 tiles = 2 seconds, so
those rules line up. It is also easy to follow by eye on a phone. Level 1
lasts about 23 s, much shorter than the 2–4 minutes in DESIGN.md; that gap is
for the Week 6 playtest to fix (longer path, wait signs, slower speed), not
for this week.

## Logic (src/logic/, pure, no Phaser)
- `findPath(level) → [{col, row}, ...]`
  Takes the result of `parseLevel`. Returns every tile from start to finish in
  walking order, start first, finish last. Steps up/down/left/right over
  walkable tiles, never back onto a tile already in the list. If a tile has
  more than one new walkable neighbour, take the first in the order up, right,
  down, left (placeholder; Week 3 signs replace this).
- `walkProgress(elapsedMs, speed, pathLength) → number`
  Distance walked in tiles: `elapsedMs / 1000 × speed`, never below 0 and
  never above `pathLength − 1`.
- `pointOnPath(path, distance) → {col, row}`
  Position along the path; can be between tiles (e.g. `col: 0.5`). Distance
  below 0 gives the first tile; at or above the end gives the last tile.
- `hasArrived(distance, pathLength) → boolean`
  `true` when `distance >= pathLength − 1`.

Phaser only: keeps the state and an elapsed-time counter (adds the frame's
`delta` only while `walking`), calls the functions above each frame, places
the stroller at `pointOnPath(path, d)` and the parent at
`pointOnPath(path, d − PARENT_TRAIL_TILES)`, converted with `tileToPixel`
(which already works with in-between values), shows and hides the texts.

## Acceptance criteria
1. `npm test` passes; `npm run build` succeeds with no errors.
2. `findPath(parseLevel(level01))` has length 24; item 0 is `{col: 0, row: 4}`,
   item 1 is `{col: 1, row: 4}`, item 4 is `{col: 3, row: 3}`, item 23 is
   `{col: 15, row: 4}`; each item is exactly one step up, down, left or right
   from the one before; no tile appears twice.
3. `walkProgress(0, 1, 24)` → 0; `walkProgress(1500, 1, 24)` → 1.5;
   `walkProgress(2000, 0.5, 24)` → 1; `walkProgress(30000, 1, 24)` → 23;
   `walkProgress(-100, 1, 24)` → 0.
4. With the level-1 path: `pointOnPath(path, 0)` → `{col: 0, row: 4}`;
   `pointOnPath(path, 0.5)` → `{col: 0.5, row: 4}`; `pointOnPath(path, 4.5)`
   → `{col: 3, row: 2.5}`; `pointOnPath(path, 99)` → `{col: 15, row: 4}`;
   `pointOnPath(path, -1)` → `{col: 0, row: 4}`.
5. `hasArrived(22.9, 24)` → `false`; `hasArrived(23, 24)` → `true`.
6. On load the stroller (`STROLLER_SIZE` px, `STROLLER_COLOUR`) and parent
   (`PARENT_SIZE` px, `PARENT_COLOUR`) sit centred on the start tile, and
   `START_HINT_TEXT` shows centred horizontally at `y = MESSAGE_Y`. Nothing moves.
7. The first tap or click anywhere hides the hint and starts the walk; it does
   not draw the outline. Later taps never stop, restart or speed up the walk.
8. While walking, the stroller moves smoothly at `WALK_SPEED` tiles per
   second along the path tiles only, and the parent follows
   `PARENT_TRAIL_TILES` behind it on the path (both on the start tile at the
   very beginning).
9. When the stroller reaches the finish tile centre (about 23 s after the tap
   at speed 1), both squares stop there and `WIN_TEXT` shows centred
   horizontally at `y = MESSAGE_Y` and stays.
10. During `walking` and `won`, tapping a tile outlines it as in Week 1–2; the
    outline is drawn under the parent and stroller.
11. If the level is broken, the error text shows as before and no walker or hint appears.
12. Every number, colour and text in scene files comes from `src/config.js` or
    the level file; the "no raw numbers other than 0, 1, 2" test covers any new
    scene file too. `src/logic/` does not import Phaser.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ and turn the phone sideways.
3. You see the map from last week, a pink square with a small dark blue square
   on the blue home tile, and "Tap to start walking" at the top. Nothing moves.
4. Tap anywhere once. The words disappear, no white outline appears, and the
   pink square glides along the beige path with the blue one just behind it.
5. While they walk, tap a few tiles: the white outline jumps around, and the
   walkers keep going at the same pace, passing over the outline.
6. They never leave the beige path. Count roughly: about 23 seconds after your
   tap they stop on the yellow tile and "Made it to the park bench!" appears.
7. Wait 5 more seconds: nothing moves, the message stays. Reload the page to
   walk again.

## Assumptions (owner, please correct if wrong)
- The walk starts on a tap (option A below). If you pick another option,
  criteria 6–7 change and nothing else.
- Parent and stroller are two placeholder squares: stroller in front, parent
  half a tile behind, so you can tell which way they're going.
- Win message only, no "play again" button: restart belongs to Week 5.
- 1 tile per second for now; real tuning happens in the Week 6 playtest.
- The first tap only starts the walk, so it doesn't also outline a tile by surprise.
- No change to the level file format: the route is worked out from the tiles.
