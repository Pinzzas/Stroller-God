# TODO

## Done (accepted by owner)
- **Week 1–2: Grid map** — level 1 loaded from `levels/level-01.json` and drawn as coloured squares; tap outlines a tile; plain error text if the level file is broken. Spec: `specs/week1-2-grid-map.md`.

## Leftovers (not urgent)
- Tap outline may overlap neighbouring tiles by about 1 px (cosmetic). From Week 1–2 review.
- `ERROR_ORIGIN` (0.5) is in `src/config.js` but missing from the spec's tuning table. From Week 1–2 review.
- `validateLevel` does not check that `cols`/`rows` are numbers or that each row is a string. Add before levels 2–4. From Week 1–2 review.
- The Week 1–2 commit "Add Week 1-2 grid map spec and level 1" has a model name in its attribution line. Not rewritten (would need a force push).
