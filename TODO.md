# TODO

## Done (accepted by owner)
- **Week 3: Signs** — arrow and wait signs placed by tapping a sign button then a tile; arrows steer at forks, wait sign stops the parent 3 s; long-press or right-click picks a sign up; parent never enters dead ends. Test map: `?level=3`. Spec: `specs/week3-signs.md`.
- **Week 2: Walking** — parent and stroller walk from home to the park bench at 1 tile per second; tap to start; pause (Space or "II" button) and 2x speed (F or "1x/2x" button); win message at the bench. Spec: `specs/week2-walking.md`.
- **Week 1–2: Grid map** — level 1 loaded from `levels/level-01.json` and drawn as coloured squares; tap outlines a tile; plain error text if the level file is broken. Spec: `specs/week1-2-grid-map.md`.

## Leftovers (not urgent)
- Tapping a placed sign slightly off-centre starts the walk instead of turning it. Give signs a full-tile tap area. From Week 3 review.
- The count number on a used-up sign button ("0") isn't faded. From Week 3 review.
- Right and middle mouse clicks act like a tap in a few places. From Week 3 review.
- A press that starts on a sign still counts if the finger lifts elsewhere. From Week 3 review.
- `GridScene.js` is about 380 lines; move sign buttons and drawing into their own file. From Week 3 review.
- `Object.hasOwn` in `levelChoice.js` breaks `?level=` on iPhones older than iOS 15.4. From Week 3 review.
- Add a real "enough items for hazards" level check once hazards exist. From Week 3 tests.
- R key and scroll-wheel rotation for arrows were left out. Add to DESIGN.md "Later" if wanted.
- `ERROR_ORIGIN` is also used for normal text (hint, win and button labels). Rename to `TEXT_ORIGIN`. From Week 2 review.
- Tap outline may overlap neighbouring tiles by about 1 px (cosmetic). From Week 1–2 review.
- `ERROR_ORIGIN` (0.5) is in `src/config.js` but missing from the spec's tuning table. From Week 1–2 review.
- `validateLevel` does not check that `cols`/`rows` are numbers or that each row is a string. Add before levels 2–4. From Week 1–2 review.
- The Week 1–2 commit "Add Week 1-2 grid map spec and level 1" has a model name in its attribution line. Not rewritten (would need a force push).
