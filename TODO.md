# TODO

## Done (accepted by owner)
- **Week 2: Walking** — parent and stroller walk from home to the park bench at 1 tile per second; tap to start; pause (Space or "II" button) and 2x speed (F or "1x/2x" button); win message at the bench. Spec: `specs/week2-walking.md`.
- **Week 1–2: Grid map** — level 1 loaded from `levels/level-01.json` and drawn as coloured squares; tap outlines a tile; plain error text if the level file is broken. Spec: `specs/week1-2-grid-map.md`.

## Leftovers (not urgent)
- `findPath` takes the first open neighbour at each junction, so on levels with forks it can take a dead-end branch. Fix in Week 3 with signs. From Week 2 review.
- `ERROR_ORIGIN` is also used for normal text (hint, win and button labels). Rename to `TEXT_ORIGIN`. From Week 2 review.
- Tap outline may overlap neighbouring tiles by about 1 px (cosmetic). From Week 1–2 review.
- `ERROR_ORIGIN` (0.5) is in `src/config.js` but missing from the spec's tuning table. From Week 1–2 review.
- `validateLevel` does not check that `cols`/`rows` are numbers or that each row is a string. Add before levels 2–4. From Week 1–2 review.
- The Week 1–2 commit "Add Week 1-2 grid map spec and level 1" has a model name in its attribution line. Not rewritten (would need a force push).
