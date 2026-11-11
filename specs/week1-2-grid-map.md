# Week 1–2: Grid map from a level JSON file

Build plan: DESIGN.md section 10, Week 1–2. Status: waiting for owner approval.

## In plain words
The test square goes away. Instead the game reads `levels/level-01.json` and
draws the map as a 16 × 9 grid of coloured squares: green grass, a beige
winding path, a blue start (home) and a yellow finish (park bench). Tapping a
tile puts a white outline on it, so you can check on your phone that the game
knows which tile your finger hit (needed later for dragging items).

## Goal
As the player, I open the game and see the whole level-1 map at once, with a
clear path from home to the park bench.

## In scope
- A level file format (below) and the first level file, `levels/level-01.json`.
- Pure functions in `src/logic/` that read and check a level, and convert
  between pixels and tiles.
- A new `GridScene` that draws the level with coloured squares and outlines
  the tapped tile.
- Removing the Week 1 placeholder: `SetupScene.js`, `nextColourIndex.js`, the
  square and title values in `src/config.js`, and the tests that only covered them.

## Out of scope
- Parent and stroller, walking, winning (Week 2).
- Signs and junction behaviour (Week 3). Level 1 has no junctions.
- Hazards and items, the item tray, drag and drop (Weeks 3–4).
- Wake meter, stars, level select, more than one level.
- Real art, sound, text labels on tiles.

## Level JSON format
```json
{
  "id": "level-01",
  "name": "Old-town cobblestones",
  "cols": 16,
  "rows": 9,
  "tiles": ["................", "...one string per row, top row first..."]
}
```
- `tiles` has exactly `rows` strings, each exactly `cols` characters long.
- One character per tile (`TILE_SYMBOLS` in config):
  `.` grass, `#` path, `S` start, `F` finish.
- Exactly one `S` and one `F`. Start and finish count as walkable, like path.
- Walking is up, down, left, right only (no diagonals).
- Later weeks will add keys such as `hazards` and `items`; the loader must
  ignore keys it does not know.

## Level 1 (levels/level-01.json)
- 16 × 9. Start at column 0, row 4 (left edge, middle). Finish at column 15,
  row 4 (right edge, middle). Columns and rows count from 0, top-left.
- One winding path of 22 path tiles, up and down like old-town lanes, with no
  junctions (no walkable tile has more than 2 walkable neighbours).
- Rows 0, 1, 7 and 8 are all grass, leaving room for the item tray later.

## Acceptance criteria
1. `npm test` passes; `npm run build` succeeds with no errors.
2. `levels/level-01.json` is valid JSON matching the format above, with
   `cols` 16, `rows` 9, start at `{col: 0, row: 4}`, finish at `{col: 15, row: 4}`.
3. In level 1, every walkable tile has at most 2 walkable neighbours, and you
   can walk from start to finish (checked through `validateLevel`).
4. `parseLevel(level01)` returns `cols` 16, `rows` 9, a 9 × 16 array of tile
   names, and `tiles[4][0] === 'start'`, `tiles[4][15] === 'finish'`,
   `tiles[0][0] === 'grass'`, `tiles[4][1] === 'path'`.
5. `validateLevel` returns `[]` for level 1, and returns at least one message
   for each of these broken levels: wrong number of rows; a row of the wrong
   length; an unknown character (e.g. `X`); no `S`; two `F`s; start and finish
   not connected by walkable tiles.
6. `tileToPixel(0, 0, 64)` → `{x: 32, y: 32}`; `tileToPixel(15, 8, 64)` →
   `{x: 992, y: 544}`.
7. `pixelToTile(10, 10, 64, 16, 9)` → `{col: 0, row: 0}`;
   `pixelToTile(1000, 570, 64, 16, 9)` → `{col: 15, row: 8}`;
   `pixelToTile(1024, 0, 64, 16, 9)` → `null`; `pixelToTile(-1, 5, 64, 16, 9)` → `null`.
8. The game opens straight into `GridScene` showing level 1. Each tile is a
   square of `TILE_SIZE − TILE_GAP` (62 px) centred in its 64 px cell, so thin
   cream lines show between tiles. Colours: grass `GRASS_COLOUR`, path
   `PATH_COLOUR`, start `START_COLOUR`, finish `FINISH_COLOUR`.
9. Tapping or clicking any tile draws a white outline (`HIGHLIGHT_COLOUR`,
   `HIGHLIGHT_WIDTH` px) around that tile only. Tapping another tile moves the
   outline there. Tapping the same tile again keeps it there.
10. If `validateLevel` returns messages, the scene draws no grid and shows
    `Level error: <first message>` in the centre instead of a blank screen.
11. The old square, the text "Stroller God – setup OK", `SetupScene.js` and
    `nextColourIndex.js` are gone, and the tests for them are removed or
    updated. The "no raw numbers other than 0, 1, 2" test now checks `GridScene.js`.
12. Every number and colour in `GridScene.js` comes from `src/config.js` or
    the level file. `src/logic/` does not import Phaser.

## Controls and states
- Tap or click a tile: outline it. Nothing else is interactive.
- States: "showing map" and "level error". No playing / paused / won / woke-up yet.

## Start, end and fail conditions
- Start: page loads, level 1 is drawn.
- End / fail: none this week.

## Tuning values (src/config.js)
Keep `TILE_SIZE` 64, `GRID_COLS` 16, `GRID_ROWS` 9, `GAME_WIDTH`, `GAME_HEIGHT`,
`BG_COLOUR`. Remove `SQUARE_SIZE`, `SQUARE_COLOURS`, `TITLE_*`. Add:

| Name | Value | Meaning |
|---|---|---|
| `TILE_GAP` | 2 | Pixels of cream between tiles |
| `TILE_SYMBOLS` | `{ '.': 'grass', '#': 'path', 'S': 'start', 'F': 'finish' }` | Level file characters |
| `WALKABLE_TILES` | `['path', 'start', 'finish']` | Tiles the parent can walk on |
| `GRASS_COLOUR` | `0x9ccf8f` | Soft green |
| `PATH_COLOUR` | `0xd9c7a3` | Cobblestone beige |
| `START_COLOUR` | `0x7fb2e5` | Blue (home) |
| `FINISH_COLOUR` | `0xf5d36b` | Yellow (park bench) |
| `HIGHLIGHT_COLOUR` | `0xffffff` | Tapped-tile outline |
| `HIGHLIGHT_WIDTH` | 4 | Outline thickness in pixels |
| `ERROR_FONT_SIZE` | `'24px'` | Level error text |
| `ERROR_COLOUR` | `'#a33a2b'` | Level error text colour |

## Logic (src/logic/, pure, no Phaser)
- `parseLevel(json) → { id, name, cols, rows, tiles, start, finish }`
  `tiles` is a 2D array `tiles[row][col]` of tile names; `start` and `finish`
  are `{col, row}`. Assumes the level is valid (call `validateLevel` first).
- `validateLevel(json) → string[]`
  Returns plain-English problems, e.g. `"Row 3 has 15 tiles, expected 16"`;
  `[]` means fine. Checks row count, row length, unknown characters, exactly
  one `S` and one `F`, and that `F` can be reached from `S` (up/down/left/right
  over walkable tiles).
- `tileToPixel(col, row, tileSize) → {x, y}` centre of the tile.
- `pixelToTile(x, y, tileSize, cols, rows) → {col, row} | null`
  `null` when outside the grid.

Phaser (`src/scenes/GridScene.js`) only: imports the level JSON, calls the
functions above, draws rectangles, reads taps, draws the outline.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ and turn the phone sideways.
3. You see a green field with a beige path that zig-zags from a blue square
   on the left edge to a yellow square on the right edge. Thin cream lines
   separate all the squares. No blue test square, no "setup OK" text.
4. Follow the path with your eye: it goes right, up, right, down, right, up,
   right, with no forks.
5. Tap any green square: a white outline appears around it. Tap a path
   square: the outline jumps there. Tap the blue and yellow squares: same.
6. Tap near the corners of the screen: the outline lands on the corner tile you touched.

## Assumptions (owner, please correct if wrong)
- DESIGN.md names no tile types, so this week uses only four: grass, path,
  start, finish. Buildings, fountains etc. can come with the art pass (Week 11).
- The tap outline is a small helper, not a new feature: it proves touch and
  mouse both find the right tile, which drag and drop needs in Week 4.
- The level file has no `hazards` or `items` yet; Weeks 3–4 add them.
- The character legend lives in `src/config.js`, not in each level file, so
  all levels use the same symbols.
- The whole 16 × 9 screen is the map; the empty top and bottom rows of level 1
  leave space for the tray later.
- Removing the Week 1 square is fine, since its only job was to prove the setup.
