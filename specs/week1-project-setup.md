# Week 1: Project setup (Phaser, Vite, auto-deploy)

Build plan: DESIGN.md section 10, Week 1. Status: waiting for owner approval.

## Goal
As the owner, I open one link on my iPhone and see a simple game screen that
reacts to my tap, so I know every future change will show up there by itself.

## In scope
- A Vite + Phaser 3 project in plain JavaScript (no TypeScript).
- `src/config.js` with named values for the game size and placeholder colours.
- One placeholder scene: a coloured background, a coloured square in the
  middle, and a short title line. Tapping or clicking the square changes its colour.
- One tiny pure function in `src/logic/` (picks the next colour) so the test
  setup has something real to test.
- Automated tests with `node --test` (no test libraries).
- A GitHub Actions workflow: every push to `main` runs the tests, builds the
  game and publishes it to GitHub Pages. If tests fail, nothing is published.
- Folder skeleton: `src/logic/`, `src/scenes/`, `levels/`, `specs/`
  (empty folders keep a `.gitkeep` file so git saves them).

## Out of scope
- Any gameplay: grid, level loading, parent, stroller, hazards, items, signs,
  wake meter (Week 1–2 and later).
- Level JSON files.
- Real art, sound, fonts.
- Electron / Steam builds (after the MVP).
- Linting, formatting tools, extra libraries beyond Phaser and Vite.

## Acceptance criteria
1. `npm install` then `npm run dev` starts the game locally with no errors.
2. `npm run build` creates a `dist/` folder with no errors.
3. `npm test` runs `node --test` and all tests pass. There is at least one
   test for `nextColourIndex` (see Logic) and one that checks `src/config.js`
   exports `GAME_WIDTH = 1024` and `GAME_HEIGHT = 576`.
4. `vite.config.js` sets `base: '/Stroller-God/'` (matches the repo name
   exactly, capital S and G), so the game loads from the Pages link, not a blank page.
5. The game canvas is 1024 × 576 (16 × 9 tiles of 64 px) and scales to fit
   the screen while keeping its shape (Phaser scale mode FIT, centred).
   On an iPhone in landscape it fills the width with no scrolling.
6. The placeholder scene shows: background colour `BG_COLOUR`, a
   `SQUARE_SIZE` square in the centre in the first colour of `SQUARE_COLOURS`,
   and the text "Stroller God – setup OK" near the top.
7. Clicking the square with a mouse, or tapping it with a finger, changes it
   to the next colour in `SQUARE_COLOURS`; after the last colour it goes back
   to the first. Tapping outside the square does nothing.
8. Every number and colour used by the scene comes from `src/config.js`
   (no raw numbers in the scene file other than 0, 1 or 2 for halving).
9. `src/logic/` code does not import Phaser.
10. `.github/workflows/deploy.yml` runs on every push to `main` and does, in
    order: install (`npm ci`), test, build, publish `dist/` to GitHub Pages
    using GitHub's official Pages actions. A failing test stops the publish.
11. `package-lock.json` is committed (needed by `npm ci`).
12. `node_modules/` and `dist/` are listed in `.gitignore`.
13. After the merge to `main` and the owner's one-time setup below, the game
    is live at https://pinzzas.github.io/Stroller-God/ within about 5 minutes.

## Controls and states
- Tap or click the square: next colour. Nothing else is interactive.
- One state only: "showing". No playing / paused / won / woke-up states yet.

## Start, end and fail conditions
- Start: the page loads and the scene appears.
- End / fail: none this week.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `TILE_SIZE` | 64 | Pixels per tile (used later by the grid) |
| `GRID_COLS` | 16 | Tiles across |
| `GRID_ROWS` | 9 | Tiles down |
| `GAME_WIDTH` | 1024 | `TILE_SIZE × GRID_COLS` |
| `GAME_HEIGHT` | 576 | `TILE_SIZE × GRID_ROWS` |
| `BG_COLOUR` | `0xf3ead8` | Warm cream background |
| `SQUARE_SIZE` | 128 | Placeholder square size in pixels |
| `SQUARE_COLOURS` | `[0x7fb2e5, 0xf2a7a0, 0x9ccf8f, 0xf5d36b]` | Blue, pink, green, yellow |

## Logic (src/logic/, pure, no Phaser)
- `nextColourIndex(currentIndex, colourCount) → number`
  Returns `currentIndex + 1`, or `0` when that would reach `colourCount`.
  Examples: `(0, 4) → 1`, `(3, 4) → 0`, `(0, 1) → 0`.

## Owner's one-time setup on GitHub (iPhone, Safari)
The GitHub app can't change these settings, so use Safari.
1. Open Safari, go to github.com/Pinzzas/Stroller-God and sign in.
2. Tap the **aA** button in the address bar, then **Request Desktop Website**.
3. Tap **Settings** (top row of tabs; swipe the tab row left if hidden).
4. In the left menu tap **Pages**.
5. Under **Build and deployment**, set **Source** to **GitHub Actions**.
   Nothing else to change; there is no Save button for this.
6. Only if the deploy later fails with a permissions error: **Settings →
   Actions → General → Workflow permissions**, choose **Read and write
   permissions**, tap **Save**.

Do this once, before or right after the first merge to `main`.

## Phone test checklist (owner)
1. In Safari on github.com/Pinzzas/Stroller-God, tap the **Actions** tab.
   The newest run should have a green tick. (Yellow dot = still running, wait
   a minute and refresh. Red cross = tell the producer.)
2. Open https://pinzzas.github.io/Stroller-God/
3. You should see a cream screen, a blue square in the middle and the text
   "Stroller God – setup OK" at the top. (If you see a blank page, tell the producer.)
4. Tap the square. It turns pink. Tap again: green, then yellow, then blue again.
5. Tap the cream area outside the square. Nothing changes.
6. Turn the phone sideways. The game resizes to fit, keeps its shape, and
   you don't need to scroll.
7. Optional: open the same link on any computer and click the square. Same colours.

## Assumptions (owner, please correct if wrong)
- Game size 1024 × 576 (16 × 9 tiles of 64 px), from "about 16 × 9 tiles" in
  DESIGN.md. Phones show it smaller in portrait; landscape is the intended way to play.
- The colour-changing square is only there to prove tap and click both work.
  It will be removed in Week 1–2 when the grid arrives.
- Phaser 3 and Vite are installed from npm (the normal package source); they
  are the agreed stack, not new libraries.
- The live link uses lowercase `pinzzas.github.io` (GitHub always does this),
  but the path keeps the exact repo name `/Stroller-God/`.
- Tests run in the deploy workflow too, so broken work can't reach the live link.
