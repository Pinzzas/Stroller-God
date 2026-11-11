# Week 2: Parent and stroller walk the path

Build plan: DESIGN.md section 10, Week 2. Status: waiting for owner approval
(revised: owner chose tap-to-start, 1 tile per second, and pause + 2x speed now).

## In plain words
A pink square (the stroller) with a dark blue square just behind it (the
parent) appears on the blue home tile. The words "Tap to start walking" show
at the top. When you tap, they glide along the beige path at a steady pace,
one tile per second, and two round-cornered buttons appear in the top-right
corner: a pause button and a fast-forward button. Pause freezes the walk;
tap it again to carry on. Fast-forward makes them walk twice as fast; tap it
again to go back to normal. On a computer, Space and F do the same. When the
stroller reaches the yellow park bench, they stop and "Made it to the park
bench!" appears. No hazards, no meter, nothing to lose yet. Level 1 takes
about 23 seconds at normal speed, about 12 at 2x.

## Goal
As the player, I tap once and watch the parent push the stroller along the
whole path to the park bench, pausing or speeding them up whenever I like,
and I see that I've won when they arrive.

## In scope
- Pure functions in `src/logic/` that find the route through the level, say
  where the walker is after a given time, and handle pause and speed toggles.
- Drawing the parent and stroller as placeholder squares in `GridScene`
  (or a small helper file it imports) and moving them every frame.
- A "Tap to start walking" hint and a win message.
- Pause (Space key + on-screen button) and 2x speed (F key + on-screen button).

## Out of scope
- Signs and junctions (Week 3). Level 1 has no junctions.
- Hazards, items, the item tray, drag and drop (Weeks 3–4). Placing items while
  paused (DESIGN.md "Pausing") arrives with drag and drop in Week 4.
- Wake meter, baby states, fail state, restart button (Week 5).
- Stars, level select, saving progress (Week 7). Nothing is saved; reload the
  page to walk again. The 2x choice is not remembered after a reload.
- A "Paused" overlay, dimming the map, or a pause menu. The button label
  change is the only pause signal this week.
- Speeds other than 1x and 2x.
- Walking animation, turning to face a direction, sound, button art, the funny
  end moment (Week 11 art pass).
- Changes to `levels/level-01.json`. None are needed.

## Controls and states
Two things are tracked: the **state** (below) and the **speed multiplier**
(1 or 2, starts at 1, kept through pause and resume).

| State | Shows | Tap / click on a tile | Pause button or Space | 2x button or F |
|---|---|---|---|---|
| `ready` | Map, walker on start, "Tap to start walking". No buttons. | First tap anywhere: hint disappears, buttons appear, state becomes `walking`. Does **not** outline. | Space: nothing | F: nothing |
| `walking` | Walker moving, both buttons | Outlines the tapped tile. Never changes the walk. | Becomes `paused` | Toggles speed 1 ↔ 2 |
| `paused` | Walker frozen where it is, both buttons, pause button shows the resume label | Outlines the tapped tile | Becomes `walking`, walker carries on from the same spot | Toggles speed 1 ↔ 2 (takes effect on resume) |
| `won` | Walker stopped on finish, win message. Buttons hidden. | Outlines the tapped tile | Nothing | Nothing |
| level error | Error text only (unchanged) | Nothing | Nothing | Nothing |

- Tapping a button never outlines the tile underneath it and never counts as
  the "first tap" (buttons are hidden in `ready` anyway).
- Buttons sit in the empty top rows 0–1, top-right, so they never cover the
  path or the hint/win text.
- Button looks (placeholder): a `BUTTON_SIZE` square in `BUTTON_COLOUR` with a
  text label. Pause button label is `PAUSE_LABEL` while walking and
  `RESUME_LABEL` while paused. Speed button label is `SPEED_LABEL_NORMAL` at 1x
  and `SPEED_LABEL_FAST` at 2x; at 2x its square turns `BUTTON_ACTIVE_COLOUR`.
- Outline during the walk works exactly as before (helper for Week 4 drag and
  drop). Draw order, bottom to top: tiles, outline, parent and stroller,
  buttons, texts.

## Start, end and fail conditions
- Start: page loads in `ready` at speed 1; the first tap anywhere on the game
  starts the walk. Keys do not start the walk.
- End (win): the stroller reaches the centre of the finish tile. Both squares
  stop there, buttons hide, the win message appears and stays. No saving, no
  next level.
- Fail: none this week.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `WALK_SPEED` | 1 | Tiles per second at normal speed |
| `NORMAL_SPEED_MULTIPLIER` | 1 | Speed multiplier at 1x |
| `FAST_SPEED_MULTIPLIER` | 2 | Speed multiplier at 2x |
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
| `PAUSE_KEY` | `'SPACE'` | Keyboard key for pause / resume |
| `SPEED_KEY` | `'F'` | Keyboard key for 1x / 2x |
| `BUTTON_SIZE` | 80 | Button square, pixels (big enough for a thumb) |
| `BUTTON_Y` | 64 | Centre height of both buttons (same as messages) |
| `PAUSE_BUTTON_X` | 864 | Centre x of the pause button |
| `SPEED_BUTTON_X` | 960 | Centre x of the 2x button |
| `BUTTON_COLOUR` | `0xfff7e6` | Pale cream button |
| `BUTTON_ACTIVE_COLOUR` | `0xf5d36b` | Yellow: 2x is on |
| `BUTTON_FONT_SIZE` | `'28px'` | Button label size |
| `BUTTON_TEXT_COLOUR` | `'#4a3b2a'` | Warm dark brown |
| `PAUSE_LABEL` | `'II'` | Pause button label while walking |
| `RESUME_LABEL` | `'>'` | Pause button label while paused |
| `SPEED_LABEL_NORMAL` | `'1x'` | Speed button label at 1x |
| `SPEED_LABEL_FAST` | `'2x'` | Speed button label at 2x |

Button placement check: the buttons span x 824–1000 and y 24–104, inside the
1024 × 128 px empty top strip; the win text (centred at x 512, roughly
x 300–720) does not reach them.

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
- `advanceTime(elapsedMs, deltaMs, state, multiplier) → number`
  Walk-clock time after one frame: `elapsedMs + deltaMs × multiplier` when
  `state` is `'walking'`; otherwise `elapsedMs` unchanged. (Adding scaled time
  each frame means switching speed never makes the walker jump.)
- `togglePause(state) → state`
  `'walking'` → `'paused'`, `'paused'` → `'walking'`, anything else is returned
  unchanged.
- `toggleSpeed(multiplier, normal, fast) → number`
  Returns `fast` if `multiplier` equals `normal`, otherwise `normal`.

Phaser only: keeps the state, the multiplier and the walk-clock; each frame
sets `elapsed = advanceTime(elapsed, delta, state, multiplier)`, then
`d = walkProgress(elapsed, WALK_SPEED, path.length)`, places the stroller at
`pointOnPath(path, d)` and the parent at `pointOnPath(path, d − PARENT_TRAIL_TILES)`,
converted with `tileToPixel`, and switches to `won` when `hasArrived`. Button
taps and the two keys call `togglePause` / `toggleSpeed` and update labels.

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
   `START_HINT_TEXT` shows centred horizontally at `y = MESSAGE_Y`. No buttons
   show. Nothing moves. Pressing Space or F does nothing.
7. The first tap or click anywhere hides the hint, shows both buttons and
   starts the walk at 1x; it does not draw the outline. Later taps on tiles
   never stop, restart or speed up the walk.
8. While walking at 1x, the stroller moves smoothly at `WALK_SPEED` tiles per
   second along the path tiles only, and the parent follows
   `PARENT_TRAIL_TILES` behind it on the path (both on the start tile at the
   very beginning).
9. When the stroller reaches the finish tile centre (about 23 s after the tap
   at 1x with no pause), both squares stop there, both buttons hide, and
   `WIN_TEXT` shows centred horizontally at `y = MESSAGE_Y` and stays.
10. During `walking`, `paused` and `won`, tapping a tile outlines it as in
    Week 1–2; the outline is drawn under the parent and stroller.
11. If the level is broken, the error text shows as before and no walker, hint
    or button appears.
12. Every number, colour, key and text in scene files comes from
    `src/config.js` or the level file; the "no raw numbers other than 0, 1, 2"
    test covers any new scene file too. `src/logic/` does not import Phaser.
13. `advanceTime(1000, 16, 'walking', 1)` → 1016;
    `advanceTime(1000, 16, 'walking', 2)` → 1032;
    `advanceTime(1000, 16, 'paused', 2)` → 1000;
    `advanceTime(1000, 16, 'ready', 1)` → 1000;
    `advanceTime(1000, 16, 'won', 1)` → 1000.
14. `togglePause('walking')` → `'paused'`; `togglePause('paused')` →
    `'walking'`; `togglePause('ready')` → `'ready'`; `togglePause('won')` → `'won'`.
15. `toggleSpeed(1, 1, 2)` → 2; `toggleSpeed(2, 1, 2)` → 1.
16. Pause: tapping the pause button (centre `PAUSE_BUTTON_X`, `BUTTON_Y`, size
    `BUTTON_SIZE`) or pressing Space while walking freezes both squares exactly
    where they are and changes the label from `PAUSE_LABEL` to `RESUME_LABEL`.
    Tapping it or pressing Space again resumes from the same spot (no jump) and
    the label returns to `PAUSE_LABEL`. Time spent paused does not count: a walk
    with a 5 s pause arrives about 28 s after the start tap at 1x.
17. 2x speed: tapping the speed button (centre `SPEED_BUTTON_X`, `BUTTON_Y`,
    size `BUTTON_SIZE`) or pressing F changes the label from
    `SPEED_LABEL_NORMAL` to `SPEED_LABEL_FAST`, turns the button
    `BUTTON_ACTIVE_COLOUR`, and the walker moves at `WALK_SPEED ×
    FAST_SPEED_MULTIPLIER` (2 tiles per second) with no jump. Tapping it or
    pressing F again returns to 1x, `SPEED_LABEL_NORMAL` and `BUTTON_COLOUR`.
    At 2x from the start tap with no pause, the walk takes about 11.5 s.
18. Speed and pause are independent: toggling speed while paused changes the
    label and colour but nothing moves until resume, which then uses the new
    speed. Pausing does not reset the speed.
19. Tapping either button never draws the outline on the tile underneath it.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ and turn the phone sideways.
3. You see the map from last week, a pink square with a small dark blue square
   on the blue home tile, and "Tap to start walking" at the top. No buttons
   yet. Nothing moves.
4. Tap anywhere once. The words disappear, no white outline appears, two cream
   buttons appear top-right ("II" and "1x"), and the pink square glides along
   the beige path with the blue one just behind it.
5. While they walk, tap a few tiles: the white outline jumps around, and the
   walkers keep going at the same pace, passing over the outline.
6. Tap **II**. Both squares freeze and the button now shows ">". Tap a tile:
   the outline still moves. Wait a few seconds, then tap **>**: they carry on
   from exactly where they stopped, and the button shows "II" again.
7. Tap **1x**. It turns yellow and shows "2x", and the walkers visibly speed up
   to double pace without jumping. Tap it again: back to cream "1x" and normal pace.
8. They never leave the beige path. When they reach the yellow tile they stop,
   both buttons vanish and "Made it to the park bench!" appears.
9. Reload and tap to start, then tap **1x** straight away and don't touch
   anything else: they reach the bench in about 12 seconds instead of 23.
10. Wait 5 more seconds: nothing moves, the message stays. Reload the page to
    walk again.

(Space and F can't be checked on a phone without a keyboard; the tester covers
them in the automated tests and the reviewer checks the key wiring. If you
have a keyboard for your iPhone or iPad, Space should do the same as II, and F
the same as 1x/2x.)

## Assumptions (owner, please correct if wrong)
- The walk starts on a tap anywhere (your choice A). Space and F do **not**
  start it; only a tap or click does.
- 1 tile per second (your choice A); real tuning happens in the Week 6 playtest.
- Buttons only appear once the walk starts and hide when you win, so the very
  first tap can never land on a button by accident.
- Pause and speed are separate: you can switch speed while paused, and pausing
  keeps whichever speed you were on.
- Every new walk starts at 1x; the 2x choice isn't remembered.
- Button labels are plain text placeholders ("II", ">", "1x", "2x"); real icons
  come in the Week 11 art pass.
- Buttons are 80 px squares so they're comfortable to hit with a thumb on a
  phone held sideways.
- Parent and stroller are two placeholder squares: stroller in front, parent
  half a tile behind, so you can tell which way they're going.
- Win message only, no "play again" button: restart belongs to Week 5.
- The first tap only starts the walk, so it doesn't also outline a tile by surprise.
- No change to the level file format: the route is worked out from the tiles.
