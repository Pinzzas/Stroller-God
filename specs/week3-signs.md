# Week 3: Arrow and wait signs at junctions

Build plan: DESIGN.md section 10, Week 3. Status: **waiting for owner approval**.
Three choices are open (see "Options for the owner"); the spec is written with
the recommended option for each.

## In plain words
A new test map (a first draft of level 3, the main station) has a fork. Two
buttons sit top-left: an arrow sign and a wait sign, each with a number
showing how many you have. Tap a sign button, then tap a tile to put the sign
there (tiles where it fits get a green outline). With no sign, the parent goes
straight on at a fork. An arrow at a fork sends them the way it points; tap the
arrow to turn it. A wait sign makes the parent stop on that tile for 3
seconds, then carry on. Hold your finger on a sign (or right-click it) to pick
it back up. You can do all of this before tapping start, while walking, or
while paused. Level 1 has no signs and plays exactly like last week.

## Goal
As the player, I put arrow and wait signs on the path so the parent takes the
route I choose and pauses where I want, and I can turn or take back signs at
any time.

## In scope
- Route rules that use signs, plus the fix for the Week 2 leftover: the parent
  never walks into a dead end or back onto a tile they have already walked.
- Placing, turning and picking up the two signs, with a count per level.
- A wait sign that stops the parent for `WAIT_SIGN_MS`.
- `levels/level-03.json` (draft layout, no hazards) and an optional `"signs"`
  field in level files.
- Opening level 3 with a link (`?level=3`) so it can be tested on a phone.

## Out of scope
- Hazards (Week 3–4), items, item tray and drag and drop (Week 4). Signs are
  placed by tap-then-tap this week; Week 4 decides whether drag replaces it.
- Lantern sign (Week 9). Wake meter, restart (Week 5). Level select (Week 7).
- Rotating with R or the scroll wheel (DESIGN.md "Controls"); a click rotates
  on PC this week. Add R/scroll later with the tray if wanted.
- Red "doesn't fit" tiles, a wait countdown, a preview line of the route,
  sounds, real sign art (Week 11).
- Level 3's real hazards, length and look (Week 8). The level file here is a
  test layout only.
- Other TODO leftovers (`ERROR_ORIGIN` rename, `cols`/`rows` checks).

## Options for the owner
**1. How you place a sign (the drag tray only arrives in Week 4)**
- **A (recommended): tap a sign button, then tap a tile.** Same on mouse and
  touch, quick to build, easy on a small phone screen. Week 4 can keep it as a
  second way to place things or swap it for dragging.
- B: build drag and drop now, for signs only. Matches DESIGN.md's "one
  gesture", but makes this week much bigger and overlaps Week 4.
- C: no buttons; tapping a fork cycles empty → arrow → wait → empty. Smallest
  build, but hard to discover and ignores sign counts. Thrown away in Week 4.

**2. How you see the fork this week (level 1 has none)**
- **A (recommended): level 1 stays the default; level 3's draft opens from a
  link ending in `?level=3`.** Level 1 keeps teaching only one thing.
- B: the game opens level 3 by default until Week 6. Simplest, but you can't
  play level 1 meanwhile.
- C: add a fork to level 1. Breaks the "one new thing per level" rule.

**3. What the parent does at a fork with no sign**
- **A (recommended): goes straight on** (Lemmings-style, easy to read on screen).
  If straight is impossible, takes the turn with the shortest way to the bench.
- B: always takes the shortest way to the bench. Then an arrow can only ever
  send them the long (calmer) way, never onto a shortcut.

## Words used
- **Junction (fork):** a path tile with 3 or 4 path neighbours (up, down, left,
  right). Start and finish tiles never count.
- **Open direction:** a neighbour that is a path, start or finish tile, has not
  been walked yet on this walk, and from which the finish can still be reached
  without stepping on walked tiles. This is the dead-end fix.

## Controls and states
States stay `ready`, `walking`, `paused`, `won` (plus level error). Sign buttons
appear only if the level gives at least one of that sign.

| Action | Mouse | Touch | Works in |
|---|---|---|---|
| Select a sign | Click its button (turns `BUTTON_ACTIVE_COLOUR`); click again to unselect | Tap | ready, walking, paused |
| Place it | Click a green-outlined tile | Tap | ready, walking, paused |
| Turn an arrow | Click it (left button) | Tap it (shorter than `LONG_PRESS_MS`) | ready, walking, paused |
| Pick up a sign | Right-click it | Hold at least `LONG_PRESS_MS`, then lift | ready, walking, paused |

- While a sign is selected, every tile where it fits gets a `VALID_TILE_COLOUR`
  outline. Placing clears the selection and the outlines. Tapping a tile where
  it doesn't fit does nothing and keeps the selection.
- A sign with count 0 has its button at `SIGN_BUTTON_EMPTY_ALPHA` and can't be
  selected.
- In `ready`, a tap that selects, places, turns or picks up a sign does not
  start the walk. Any other tap starts it, as in Week 2.
- Tapping a plain tile with nothing selected outlines it, as in Week 2.
- In `won`, sign buttons hide and signs can't be changed.
- Right-click must not open the browser menu; a long press on a phone must not
  open a copy/select menu.
- Draw order, bottom to top: tiles, green outlines, signs, tap outline, parent
  and stroller, buttons, texts.

## Start, end and fail conditions
- Start, win and pause/speed: unchanged from Week 2.
- Fail: none this week.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `WAIT_SIGN_MS` | 3000 | How long the parent stops at a wait sign (walk-clock time, so 2x halves it) |
| `LONG_PRESS_MS` | 500 | Hold this long to pick a sign up on touch |
| `SIGN_TYPES` | `['arrow', 'wait']` | Allowed keys in a level's `"signs"` field |
| `ARROW_DIRECTIONS` | `['up', 'right', 'down', 'left']` | Clockwise order for placing and turning arrows |
| `SIGN_SIZE` | 40 | Size of a sign on a tile and on its button, pixels |
| `SIGN_ARROW_COLOUR` | `0x3f8f8a` | Teal triangle pointing its way |
| `SIGN_WAIT_COLOUR` | `0xe0703a` | Orange-red circle (reads as "stop") |
| `VALID_TILE_COLOUR` | `0x5fbf5f` | Green outline where the selected sign fits |
| `ARROW_BUTTON_X` | 64 | Centre x of the arrow button (same `BUTTON_Y`, `BUTTON_SIZE`) |
| `WAIT_BUTTON_X` | 160 | Centre x of the wait button |
| `SIGN_COUNT_FONT_SIZE` | `'20px'` | Count number on a sign button |
| `SIGN_COUNT_OFFSET` | 24 | Count sits this many px right of and below the button centre |
| `SIGN_BUTTON_EMPTY_ALPHA` | 0.4 | Faded look when the count is 0 |
| `LEVEL_URL_PARAM` | `'level'` | Name in the link, e.g. `?level=3` |
| `LEVEL_IDS` | `{ 1: 'level-01', 3: 'level-03' }` | Which file each number opens |
| `DEFAULT_LEVEL_ID` | `'level-01'` | Opened when the link has no or an unknown number |

Placement check: sign buttons span x 24–200, y 24–104; the hint and win text
(about x 300–720) and the pause/speed buttons (x 824–1000) don't touch them.

## Level files
- New optional field `"signs": { "arrow": n, "wait": n }`, whole numbers 0 or
  more. Missing field or missing key means 0. Level 1 is unchanged (no signs).
- `levels/level-03.json` (draft, created with this spec), 2 arrows, 1 wait:
  ```
  row 2  ....##########..
  row 3  ....#......#....
  row 4  ....#......#....
  row 5  S##############F
  ```
  Start (0,5), finish (15,5). Junctions: (4,5), (11,5), (11,2). Straight along
  row 5 is 16 tiles. An arrow pointing up at (4,5) takes the loop over the top
  (22 tiles). (12,2)–(13,2) is a dead-end stub straight ahead at (11,2), and
  (11,5) is where the loop rejoins: both test the dead-end / no-going-back fix.

## Logic (src/logic/, pure, no Phaser)
A sign is `{ col, row, type: 'arrow' | 'wait', dir }` (`dir` only for arrows).
`signs` is an array of these; `supply` is `{ arrow, wait }`. No function changes
its inputs; each returns new values.

`src/logic/route.js`
- `isJunction(level, col, row) → boolean` — as defined in "Words used".
- `findRoute(level, signs, walked = [level.start]) → [{col, row}, ...]`
  Returns `walked` followed by the tiles still to walk, ending at the finish.
  From the last tile, the next tile is picked among open directions:
  1. an arrow on this tile, if its `dir` is open;
  2. otherwise straight on (same direction as the last step), if open;
  3. otherwise the open direction with the fewest steps to the finish; ties
     go up, right, down, left.
  Arrows pointing at grass, backwards or into a dead end are ignored.
- `reroute(level, signs, path, distance) → path`
  Keeps `path` from the start up to index `floor(distance) + 1` (the tile the
  stroller is on and the one it's heading to; never more than the whole path),
  then calls `findRoute` from there. Used every time a sign is placed, turned
  or picked up, so the walker never jumps. A sign only counts if the stroller
  hasn't reached the centre of its tile yet.
- `findPath(level)` stays and returns `findRoute(level, [])`.

`src/logic/signs.js`
- `signAt(signs, col, row) → sign | null`
- `canPlaceSign(level, signs, supply, type, col, row) → boolean` — true only if
  the count is above 0, the tile has no sign, and: arrow → tile is a junction;
  wait → tile is a plain path tile (not start, finish or grass).
- `placeSign(level, signs, supply, type, col, row) → { signs, supply }` — adds
  the sign and lowers the count by 1; a new arrow points at the first walkable
  neighbour in `ARROW_DIRECTIONS` order. If `canPlaceSign` is false, returns
  copies of the inputs unchanged.
- `rotateArrow(level, signs, col, row) → signs` — turns that arrow to the next
  walkable direction clockwise, skipping grass. No arrow there → unchanged.
- `pickUpSign(signs, supply, col, row) → { signs, supply }` — removes it and
  raises its count by 1. No sign there → unchanged.
- `pressKind(heldMs, longPressMs) → 'tap' | 'long'` — `'long'` when
  `heldMs >= longPressMs`.

`src/logic/walking.js` (add)
- `stepWalk(walker, deltaMs, speed, path, signs, waitMs) → walker`
  `walker` is `{ distance, waitLeftMs, waitedIndex }`, starting `{0, 0, 0}`.
  `deltaMs` is already multiplied by the speed multiplier.
  1. If `waitLeftMs > 0`: lower it by `deltaMs` (not below 0); distance stays.
  2. Else the new distance is `distance + deltaMs / 1000 × speed`, capped at
     `path.length − 1`. If on the way it reaches or passes a whole index `i`
     with `i > waitedIndex` and `i > distance` whose tile has a wait sign, it
     stops at `i` instead, with `waitLeftMs = waitMs` and `waitedIndex = i`.
  Replaces `walkProgress` in the scene; `walkProgress` stays for its tests.

`src/logic/levelChoice.js`
- `levelIdFromUrl(search, ids, fallback) → id` — reads the `level` number from a
  link's query text (e.g. `'?level=3'`).

`src/logic/validateLevel.js` (add): if `"signs"` is present, every key must be
in `SIGN_TYPES` and every value a whole number 0 or more.

## Acceptance criteria
In these, `L3` is `parseLevel(level-03.json)`, `L1` is `parseLevel(level-01.json)`,
and `full = {arrow: 2, wait: 1}`.

1. `npm test` passes; `npm run build` succeeds with no errors.
2. `findPath(L1)` gives exactly the same 24 tiles as in Week 2 (criterion 2 of
   `specs/week2-walking.md` still passes).
3. `isJunction(L3, 4, 5)`, `(11, 5)` and `(11, 2)` → `true`; `(6, 5)`, `(4, 2)`,
   `(0, 5)`, `(15, 5)`, `(0, 0)` → `false`.
4. `findRoute(L3, [])` has 16 tiles, `(0,5)` to `(15,5)` along row 5.
5. With `[{col: 4, row: 5, type: 'arrow', dir: 'up'}]`, `findRoute` has 22
   tiles: item 5 `(4,4)`, item 7 `(4,2)`, item 14 `(11,2)`, item 15 `(11,3)`,
   item 17 `(11,5)`, item 21 `(15,5)`. It never contains `(12,2)` or `(10,5)`
   (no dead end, no walking back along row 5).
6. Adding `{col: 11, row: 2, type: 'arrow', dir: 'right'}` (into the dead end)
   to the signs in 5 gives the same 22 tiles. An arrow at `(4,5)` with `dir`
   `'left'` (backwards) or `'down'` (grass) gives the 16-tile route.
7. Each route in 4–6: every tile is one step up, down, left or right from the
   one before, and no tile appears twice.
8. With the 16-tile path `p` and the up-arrow at `(4,5)`:
   `reroute(L3, signs, p, 2.5)` and `reroute(L3, signs, p, 3.99)` → the 22-tile
   route; `reroute(L3, signs, p, 4)` and `reroute(L3, signs, p, 4.5)` → `p`
   unchanged (16 tiles). `reroute(L3, [], p, 15)` → `p`.
9. `placeSign(L3, [], full, 'arrow', 4, 5)` → signs
   `[{col: 4, row: 5, type: 'arrow', dir: 'up'}]`, supply `{arrow: 1, wait: 1}`.
   Arrow at `(11, 2)` starts with `dir: 'right'`.
10. Nothing changes for: arrow on `(6,5)` (not a junction); any sign on
    `(0,5)`, `(15,5)` or `(0,0)`; any sign on a tile that already has one; wait
    with `wait: 0`. `placeSign(L3, [], full, 'wait', 6, 5)` → one wait sign,
    supply `{arrow: 2, wait: 0}`. Wait on junction `(4,5)` is allowed.
11. `rotateArrow` on the arrow at `(4,5)`: `up` → `right` → `left` → `up` (skips
    `down`, which is grass). On `(11,2)`: `right` → `down` → `left` → `right`.
12. `pickUpSign` of the arrow at `(4,5)` with supply `{arrow: 1, wait: 1}` →
    no signs, supply `{arrow: 2, wait: 1}`. On an empty tile → unchanged.
13. None of the functions in 9–12 or `findRoute`/`reroute` change the arrays or
    objects passed in.
14. `stepWalk` with the 16-tile path, a wait sign at `(6,5)` (index 6),
    `waitMs` 3000, speed 1:
    `{5.5, 0, 0}` + 1000 ms → `{distance: 6, waitLeftMs: 3000, waitedIndex: 6}`;
    `{6, 3000, 6}` + 1000 → `{6, 2000, 6}`; `{6, 500, 6}` + 1000 → `{6, 0, 6}`;
    `{6, 0, 6}` + 500 → `{6.5, 0, 6}`. With no signs, `{5.5, 0, 0}` + 1000 →
    `{6.5, 0, 0}`. `{14.5, 0, 0}` + 2000 → `{15, 0, 0}`.
15. `pressKind(499, 500)` → `'tap'`; `pressKind(500, 500)` → `'long'`.
16. `levelIdFromUrl` with `LEVEL_IDS` and `DEFAULT_LEVEL_ID`: `'?level=3'` →
    `'level-03'`; `'?level=1'` → `'level-01'`; `''`, `'?level=7'`,
    `'?level=abc'` → `'level-01'`.
17. `validateLevel` gives no problems for level 1 and level 3. It reports a
    problem for `"signs": {"arrow": -1}`, `{"arrow": 1.5}`, `{"arrow": "2"}` and
    `{"lantern": 1}`.
18. The normal link opens level 1 with no sign buttons, and it plays exactly as
    in Week 2. The link ending in `?level=3` opens level 3 with the arrow button
    (count 2) and wait button (count 1) top-left.
19. Selecting the arrow turns its button `BUTTON_ACTIVE_COLOUR` and outlines
    exactly the 3 junctions in `VALID_TILE_COLOUR`; selecting wait outlines
    every plain path tile. Tapping the selected button again removes them.
20. Placing a sign draws it on the tile (`SIGN_SIZE`; arrow = `SIGN_ARROW_COLOUR`
    triangle pointing its `dir`, wait = `SIGN_WAIT_COLOUR` circle), lowers the
    count on the button, and clears selection and outlines. At count 0 the
    button is at `SIGN_BUTTON_EMPTY_ALPHA` and can't be selected.
21. On level 3 with no signs the parent walks straight along row 5 to the bench.
    With an up-arrow at `(4,5)` placed before the stroller reaches it (in
    `ready`, `walking` or `paused`), they take the loop over the top and come
    back down to row 5 at `(11,5)`, never entering `(12,2)`.
22. Tapping a placed arrow turns it to the next direction and the route changes
    to match, without the walker jumping. Turning it after the stroller
    reached its centre changes nothing for this walk.
23. At a wait sign the walker stops centred on the tile for about 3 s at 1x
    (about 1.5 s at 2x) and then carries on. Pausing during the wait freezes
    the countdown.
24. Right-click or a hold of at least `LONG_PRESS_MS` on a placed sign removes
    it and raises its count by 1; the route updates. No browser or phone menu
    appears.
25. In `ready`, selecting, placing, turning or picking up a sign does not start
    the walk; tapping anywhere else does.
26. In `won`, the sign buttons hide and tapping signs changes nothing.
27. Every new number, colour and text in scene files comes from `src/config.js`
    or the level file (the "no raw numbers other than 0, 1, 2" test covers new
    files). `src/logic/` does not import Phaser.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ sideways. Level 1 looks and plays
   like last week, no new buttons.
3. Open https://pinzzas.github.io/Stroller-God/?level=3. You see a long straight
   path with a loop above it, and two cream buttons top-left: a teal triangle
   with "2" and an orange circle with "1".
4. Tap the triangle button: it turns yellow and three fork tiles get green
   outlines. Tap the fork nearest home (5th tile from the left). A teal triangle
   pointing up appears there, the count shows "1", the outlines vanish. The
   walk has not started.
5. Tap the triangle on the map: it points right. Tap again: left. Again: up.
6. Tap the orange button, then a plain path tile on the loop. An orange circle
   appears; the button shows "0" and looks faded.
7. Tap an empty grass tile to start. The parent turns up at the arrow, walks
   the loop, does **not** go into the short stub at the top-right, stops on
   the orange circle for about 3 seconds, comes down and reaches the bench.
8. Reload the level-3 link, start walking with no signs: they go straight to
   the bench. Reload, start, and quickly place the arrow before they reach the
   fork: they turn up.
9. Place a sign, then hold your finger on it for about half a second and lift:
   it disappears and its count goes back up. No phone menu pops up.
10. Pause with **II**, place and turn signs while paused, then resume: the
    parent follows the new signs.

## Assumptions (owner, please correct if wrong)
- Choices 1A, 2A and 3A above (tap-then-tap, `?level=3` link, straight on).
- Arrows only go on forks; wait signs can go on any plain path tile, including
  forks, because roaming hazards will cross anywhere. One sign per tile.
- A new arrow points at the first path direction going clockwise from up; you
  turn it by tapping. It can point at any path neighbour; pointing backwards
  or into a dead end is simply ignored (the parent never walks into a dead end).
- A sign must be placed before the stroller reaches the centre of its tile to
  count for this walk.
- The wait lasts its full 3 s even if you pick the sign up mid-wait; 2x makes
  the wait shorter like everything else.
- Sign counts come from the level file; picking a sign up gives it back
  (DESIGN.md: "Signs can be picked up and reused").
- Level 3's file is a test layout; Week 8 makes the real one (longer, with
  trams and pigeons).
- Placeholder looks: teal triangle and orange-red circle, so arrow and "stop"
  read without text.
