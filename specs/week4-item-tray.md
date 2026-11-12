# Week 4: Item tray with drag and drop, item counts, right and wrong matches

Build plan: DESIGN.md section 10, Week 4. Status: **waiting for owner approval**.
Five choices are open (see "Options for the owner"); the spec is written with
the recommended option for each. Choices 4–5 came with the owner's tap-and-drop
request.

## In plain words
Level 1 gets an item tray in the bottom-left corner: a plank (brown bar, 2 of
them), a white-noise speaker (dark square, 1) and a "Shh" card (white card, 1).
Press an item and drag it with your finger or mouse. The tile under it lights
green if a hazard there can take an item, red if not. Let go on a hazard:
- **Right item:** it stays on the hazard, a green ring puffs out, and the
  hazard calms down (no more ring, no growing).
- **Wrong item:** it's used up anyway: it shrinks away and the hazard shakes.
Let go anywhere else and nothing is used. Counts go down as you use items.
You can also **tap** an item (its button turns yellow), then tap a hazard: same
result as dragging it there.
Nothing touches the baby yet: the wake meter comes in Week 5.

## Goal
As the player, I drag items from the tray onto hazards and can see at once
whether I picked the right one.

## In scope
- Item tray with counts from the level file (`"items"` field).
- Drag and drop with mouse and touch; green/red tile under the dragged item.
- Right match fixes the hazard; wrong match wastes the item. Visible feedback only.
- Three items: plank, speaker, "Shh" card (the ones level 1's hazards need).

## Out of scope
- Wake meter, "+10 for a wrong item", baby states, fail and restart (Week 5).
- Sound for a wrong item (DESIGN.md "small noise"): Week 11 with all sounds.
- Picking a placed item back up (see option 2). Items on roaming hazards and
  breadcrumbs (Week 8, level 3). Lure items placed off the path (Week 8, level 4).
- The speaker's "2-tile radius": this week it only fixes the hazard it is
  dropped on. Radius effects need the wake meter to mean anything (Week 5+).
- Signs switching to drag (see option 1). Vespa and level 1 tuning (Week 6).
- Real item art (Week 11). Bigger basket upgrade (Week 10). TODO leftovers.

## Options for the owner
**1. How signs are placed now that items drag**
- **A (recommended): signs stay tap-then-tap; only items drag.** Smallest
  change, nothing you already accepted breaks. Revisit at the Week 12 polish.
- B: signs also drag from their buttons. One gesture for everything (as
  DESIGN.md says), but reopens Week 3 work and doubles this week's testing.

**2. Picking a placed item back up (DESIGN.md "Controls" lists it)**
- **A (recommended): not this week; a placed item stays.** A right item has
  done its job; a wrong one is "wasted" by the rules. Picking up matters for
  lure items (level 4), so build it in Week 8.
- B: long-press / right-click a right item to take it back (hazard un-fixes,
  count +1). More to build and test now, little use on level 1.
- C: remove the row from DESIGN.md's Controls table entirely.

**3. Where the dragged item sits under your finger**
- **A (recommended): centred on the finger; the tile under the finger is the
  target.** Simple and predictable. The green/red outline is bigger than a
  fingertip, so you still see it.
- B: lifted `ITEM_DRAG_LIFT` px above the finger so the item isn't hidden;
  the target is the tile under the item. Nicer on small phones, but you
  aim with a point you aren't touching.

**4. Tap-and-drop: tapping a tile with no drop target (grass, plain path,
fixed or `done` hazard)**
- **A (recommended): cancels; nothing used, selection ends.** Same as letting
  go of a drag there. The map fills the whole screen, so this is also the easy
  "tap outside to cancel".
- B: keeps the item selected, like signs do on a tile where they don't fit.
  Forgiving, but then the only cancel is tapping the button again.

**5. Tap-and-drop: showing where the selected item can go**
- **A (recommended): every current drop target gets a green outline**, like a
  selected sign; a hazard loses its outline the moment it turns `done`.
  Consistent with signs. It still only says "hazard here", not "right item".
- B: no outlines, only the yellow button. Less to build, harder to aim.

## Words used
- **Item type:** `plank`, `speaker`, `shh` (`ITEM_TYPES`).
- **Supply:** `{ plank, speaker, shh }` counts left this walk.
- **Drop target:** a hazard that is not roaming, not `done` and not fixed yet.
  A `done` hazard has already gone off, so it's too late.
- **Fixed:** a hazard that got its correct item. It keeps that until reload.

## Controls and states
States stay `ready`, `walking`, `paused`, `won` (plus level error).

| Action | Mouse | Touch | Works in |
|---|---|---|---|
| Pick up an item | Press on a tray button with count > 0 | Touch it | ready, walking, paused |
| Aim | Move while holding; item follows the pointer | Move finger | same |
| Drop | Release | Lift finger | same |
| Select an item (tap-and-drop) | Click a tray button with count > 0 without moving | Tap it | same |
| Drop the selected item | Click a tile | Tap a tile | same |
| Cancel the selection | Click the yellow button again, a no-target tile, or outside the game | Tap the same | same |

- While dragging, only the tile under the pointer gets an outline
  (`DROP_OUTLINE_WIDTH`): `VALID_TILE_COLOUR` on a drop target, `INVALID_TILE_COLOUR`
  on any other grid tile. Over a tray button: no outline. The outline does
  not tell you if the item is right; only the drop does.
- Drop on a drop target: right or wrong match (below). Drop anywhere else, or
  with the pointer off the game: the dragged item disappears, count unchanged.
- The hazard check happens at the moment of release (a hazard can turn
  `done` while you drag).
- In `ready`, a press that starts on the tray never starts the walk.
- Starting a drag clears a selected sign and its green outlines.
- In `won`, the tray hides, placed items stay drawn, and a drag in progress
  ends with nothing used.
- While `paused`, drops work; hazard states stay frozen. Feedback animations
  may still play.
- Only the first finger counts; dragging must not scroll, zoom or open a
  phone menu.

### Tap and drop (added on owner request; works with drag, doesn't replace it)
- **Tap or drag?** A press on a tray button that ends within
  `TAP_MOVE_TOLERANCE_PX` of where it started is a tap; once the pointer moves
  further, it's a drag. Nothing follows the pointer until it is a drag.
- **Select:** tapping a button with count > 0 selects that item: the button
  fill turns `BUTTON_ACTIVE_COLOUR` (as a selected sign), the count does not
  change, and (choice 5A) every current drop target gets a `VALID_TILE_COLOUR`
  outline drawn like a sign outline. Only one thing is selected at a time.
- **Switch:** tapping another item's button selects that one instead.
  Tapping a count-0 button changes nothing (the current selection stays).
- **Drop:** tapping a tile runs exactly the drag rules at that moment
  (`dropItem`): right match, wrong match or nothing used, with the same
  feedback. After any tile tap the selection ends (choice 4A).
- **Cancel, nothing used:** tap the selected button again, a tile with no drop
  target, or outside the game picture.
- **No side effects:** while an item is selected, a tap, right-click or long
  press on the map only does the item's drop or cancel. It never starts the
  walk, sets the Week 2 tap outline, or places, turns or picks up a sign.
- **With signs:** selecting an item clears a selected sign and its outlines;
  selecting a sign clears a selected item.
- **With drag:** starting a drag from any tray button clears the selection;
  the dragged item is the one pressed.
- **Pause, 2x:** the **II** and 2x buttons work as usual and keep the
  selection. Selecting and dropping work while paused.
- **End:** on `won` the selection clears with the tray. A reload (and the
  Week 5 restart) starts with nothing selected.

### Right match
Count −1; the item is drawn centred on the hazard (`DEPTH_ITEMS`). A
`VALID_TILE_COLOUR` ring starts at `HAZARD_RING_RADIUS`, grows to
`× RIGHT_RING_SCALE` and fades out over `RIGHT_FEEDBACK_MS`. From then on the
hazard is drawn in its `idle` look (square only, normal size, no ring, full
colour), whatever its real state.

### Wrong match
Count −1; the item appears on the hazard, then shrinks to 0 and fades out over
`WRONG_FEEDBACK_MS`. At the same time the hazard square moves left and right
by `WRONG_SHAKE_PX`, changing direction every `WRONG_SHAKE_STEP_MS`, then
returns to its spot. The hazard carries on exactly as before and can still be
fixed with the right item.

### Placeholder looks (no text; shape hints at use)
| Item | Look | Fixes |
|---|---|---|
| plank | flat brown bar (covers a rough patch) | cobbles |
| speaker | dark grey square (a box) | bells |
| shh | white upright card | neighbour |

Tray: one `ITEM_BUTTON_SIZE` cream (`BUTTON_COLOUR`) button per item type the
level gives at start (count > 0), in `ITEM_TYPES` order, at
`ITEM_TRAY_FIRST_X + index × ITEM_TRAY_SPACING`, `ITEM_TRAY_Y`. The item is
drawn in the middle; the count (`SIGN_COUNT_FONT_SIZE`, `BUTTON_TEXT_COLOUR`)
sits `ITEM_COUNT_OFFSET` px right of and below the centre. At count 0 the
button stays, faded to `SIGN_BUTTON_EMPTY_ALPHA`, and can't be dragged.
Placement: buttons span x 20–220, y 516–572 (row 8, grass on both levels).

Draw order, bottom to top: tiles, hazards, **placed items**, sign outlines,
signs, tap / **drop outline**, parent and stroller, buttons and **tray**,
texts, **dragged item**.

## Start, end and fail conditions
- Start, win, pause and 2x: unchanged. Items never stop or slow the walk.
- Fail: none this week. Running out of items is fine.

## Level files
New optional field `"items": { "plank": n, "speaker": n, "shh": n }`, whole
numbers 0 or more. Missing field or key means 0; no tray if all are 0.
- **Already edited:** `levels/level-01.json` now has
  `"items": { "plank": 2, "speaker": 1, "shh": 1 }`. Today's game ignores the
  field, so nothing changes on the live link until this is built. 2 planks so
  you can test a wrong drop and still fix the cobbles. Week 6 tunes counts.
- `levels/level-03.json`: unchanged, no items (pigeons need breadcrumbs, Week 8).

`validateLevel` reports (plain English) if `"items"` is not an object, a key
is not in `ITEM_TYPES`, or a count is not a whole number 0 or more.

## Tuning values (src/config.js)
| Name | Value | Meaning |
|---|---|---|
| `ITEM_TYPES` | `['plank', 'speaker', 'shh']` | Allowed keys in `"items"`, and tray order |
| `ITEM_KINDS` | `{ plank: { colour: 0x9a6a3a, width: 44, height: 16 }, speaker: { colour: 0x3b3f4a, width: 30, height: 30 }, shh: { colour: 0xfafafa, width: 24, height: 34 } }` | Placeholder rectangle per item, pixels |
| `HAZARD_KINDS` (add `item`) | cobbles `'plank'`, neighbour `'shh'`, bells `'speaker'`, pigeons `'breadcrumbs'` | Each hazard's one correct item (breadcrumbs joins `ITEM_TYPES` in Week 8) |
| `ITEM_BUTTON_SIZE` | 56 | Tray button square, pixels |
| `ITEM_TRAY_Y` | 544 | Centre height of the tray (row 8) |
| `ITEM_TRAY_FIRST_X` | 48 | Centre x of the first tray button |
| `ITEM_TRAY_SPACING` | 72 | Gap between tray button centres |
| `ITEM_COUNT_OFFSET` | 20 | Count sits this far right of and below the button centre |
| `INVALID_TILE_COLOUR` | `0xc0504d` | Red outline: can't drop here |
| `DROP_OUTLINE_WIDTH` | 4 | Drop outline thickness, pixels |
| `RIGHT_FEEDBACK_MS` | 600 | Green ring puff after a right match |
| `RIGHT_RING_SCALE` | 1.6 | Ring grows to this size |
| `WRONG_FEEDBACK_MS` | 600 | Wrong item shrinks and fades this long |
| `WRONG_SHAKE_PX` | 6 | Hazard shake distance, pixels |
| `WRONG_SHAKE_STEP_MS` | 75 | Shake changes direction this often |
| `DEPTH_ITEMS` | 0.75 | Placed items: above hazards, below sign outlines |
| `DEPTH_DRAG` | 7 | Dragged item: above everything |
| `TAP_MOVE_TOLERANCE_PX` | 12 | A tray press that moves at most this far is a tap (select), further is a drag |

Reused: `BUTTON_COLOUR`, `BUTTON_TEXT_COLOUR`, `SIGN_COUNT_FONT_SIZE`,
`SIGN_BUTTON_EMPTY_ALPHA`, `VALID_TILE_COLOUR`, `HAZARD_RING_RADIUS`,
`HAZARD_RING_WIDTH`, `BUTTON_ACTIVE_COLOUR` (selected item button).

## Logic (src/logic/items.js, pure, no Phaser)
`hazards` is the level's list; `states` is the `updateHazards` result;
`fixedIds` is a list of hazard ids. No function changes its inputs.

- `startingItems(levelItems, itemTypes) → supply` — one key per type, missing = 0.
- `trayItems(supply, itemTypes) → [type, ...]` — types with count > 0, in
  `itemTypes` order. Called once at level start.
- `traySlotX(index, firstX, spacing) → number` — `firstX + index × spacing`.
- `correctItem(kinds, kind) → item | null` — `kinds[kind].item`; unknown kind → `null`.
- `dropTarget(hazards, kinds, states, fixedIds, col, row) → id | null` — the
  hazard on that tile that is not roaming, not `done`, not in `fixedIds`.
- `dropItem(hazards, kinds, states, fixedIds, supply, item, col, row) →
  { result, hazardId, fixedIds, supply }` — `result` is:
  `'none'` if `supply[item]` is not above 0 or `dropTarget` is `null`
  (copies returned unchanged, `hazardId` `null`);
  `'right'` if `correctItem` matches (count −1, id added to `fixedIds`);
  otherwise `'wrong'` (count −1, `fixedIds` unchanged).
- `withFixes(states, fixedIds) → states` — copies, with `state: 'fixed'` for
  fixed ids. The scene draws `'fixed'` as described above.
- `pressGesture(dx, dy, tolerancePx) → 'tap' | 'drag'` — `'tap'` when
  `√(dx² + dy²) ≤ tolerancePx`.
- `selectItem(selected, supply, item) → item | null` — `null` if `item` is
  already `selected`; `item` if `supply[item]` is above 0; otherwise `selected`
  unchanged.
- `dropTargets(hazards, kinds, states, fixedIds) → [id, ...]` — every hazard
  `dropTarget` would accept, in level order (for the choice 5A outlines).
- A tap-drop calls `dropItem` with the selected item and the tapped tile.

Also: `validateLevel` gets the `"items"` checks; `parseLevel` adds
`items: startingItems(json.items, ITEM_TYPES)`.

## Acceptance criteria
`L1`/`L3` are the parsed level files; `S(t)` is
`updateHazards(L1.hazards, HAZARD_KINDS, null, t, L1.start, T)`;
`full = {plank: 2, speaker: 1, shh: 1}`.

1. `npm test` passes; `npm run build` succeeds with no errors.
2. All Week 1–2, 2, 3 and 3–4 criteria still pass.
3. `startingItems(full, ITEM_TYPES)` → `full`; `(undefined, …)` →
   `{plank: 0, speaker: 0, shh: 0}`; `({speaker: 1}, …)` → `{plank: 0, speaker: 1, shh: 0}`.
   `L1.items` equals `full`; `L3.items` is all zeros.
4. `trayItems(full, ITEM_TYPES)` → `['plank', 'speaker', 'shh']`;
   `trayItems({plank: 0, speaker: 1, shh: 0}, …)` → `['speaker']`.
5. `traySlotX(0, 48, 72)` → 48; `(2, 48, 72)` → 192.
6. `correctItem(HAZARD_KINDS, k)`: cobbles → `'plank'`, neighbour → `'shh'`,
   bells → `'speaker'`, pigeons → `'breadcrumbs'`, `'vespa'` → `null`.
7. `dropTarget(L1.hazards, HAZARD_KINDS, S(0), [], c, r)`: (13,4) →
   `'cobbles-1'`; (9,7) → `'neighbour-1'`; (5,3) → `'bells-1'`; (0,0) and
   (5,2) → `null`. With `fixedIds ['cobbles-1']`, (13,4) → `null`.
   (5,3) with `S(3000)` (warning) and `S(6000)` (active) → `'bells-1'`;
   with `S(10000)` (done) → `null`.
8. On `L3` with its `updateHazards` result at `walkMs 0`, `dropTarget` at
   (8,3) → `null` (roaming is never a target).
9. `dropItem(…, S(0), [], full, 'plank', 13, 4)` → `result 'right'`,
   `hazardId 'cobbles-1'`, `fixedIds ['cobbles-1']`, supply `{plank: 1, speaker: 1, shh: 1}`.
10. `dropItem(…, S(0), [], full, 'plank', 5, 3)` → `'wrong'`, `'bells-1'`,
    `fixedIds []`, supply `{plank: 1, speaker: 1, shh: 1}`. Then `'speaker'`
    on (5,3) with that supply → `'right'`, supply `{plank: 1, speaker: 0, shh: 1}`.
    `'shh'` on (9,7) → `'right'`.
11. `result 'none'`, `hazardId null`, inputs copied unchanged for: plank on
    (0,0); plank on (13,4) with supply `plank: 0`; plank on (13,4) with
    `fixedIds ['cobbles-1']`; speaker on (5,3) with `S(10000)`.
12. `withFixes(S(0), ['neighbour-1'])` → neighbour `state 'fixed'`, cobbles
    and bells unchanged; `withFixes(S(0), [])` equals `S(0)`.
13. None of the functions in 3–12 or `parseLevel` change their inputs.
14. `validateLevel` gives no problems for level 1, level 3 and a level without
    `"items"`. It reports a problem (one test each) for `"items": []`,
    `{"plank": -1}`, `{"plank": 1.5}`, `{"plank": "2"}`, `{"breadcrumbs": 1}`,
    `{"towel": 1}`.
15. Level 1 shows three tray buttons at x 48, 120, 192, y 544: a brown bar
    with "2", a dark grey square with "1", a white card with "1". `?level=3`
    shows no tray.
16. Pressing a tray button with count > 0 and moving (mouse or touch) makes
    the item follow the pointer above everything. The tile under the pointer
    is outlined green on (13,4), (9,7) and (5,3) at the start, red on any
    other tile, none over the tray.
17. Dropping the plank on the cobbles: plank stays on (13,4), green ring puff
    for about 0.6 s, count shows "1". The stroller rolls over as before.
18. Dropping the "Shh" card on the neighbour before it's `done`: card stays,
    and the neighbour never pulses, grows or fades for the rest of the walk.
    Same for the speaker on the bells before 9 s at 1x.
19. Dropping a plank on the bells: plank count −1, plank shrinks and fades on
    the tile in about 0.6 s, the gold square shakes, then the bells behave as
    before; the speaker can still fix them.
20. Dropping on grass, a path tile without a hazard, a fixed or `done` hazard,
    the tray, or outside the game: the dragged item vanishes, counts unchanged.
21. At count 0 the button is faded to `SIGN_BUTTON_EMPTY_ALPHA` and pressing it
    starts no drag.
22. In `ready`, dragging and dropping does not start the walk; a normal tap
    elsewhere still does. Drops work while `walking` and `paused` (hazards
    stay frozen while paused). In `won` the tray hides and placed items stay.
23. Starting a drag clears a selected sign and its outlines; signs on level 3
    still place, turn and pick up exactly as in Week 3.
24. On a phone, dragging does not scroll, zoom, select text or open a menu.
25. Every new number, colour and text in scene files comes from
    `src/config.js` or the level file (the "no raw numbers other than 0, 1, 2"
    test covers new files). `src/logic/` does not import Phaser.

Tap and drop:

26. `pressGesture(0, 0, 12)` and `(12, 0, 12)` → `'tap'`; `(9, 9, 12)` and
    `(0, 13, 12)` → `'drag'`.
27. `selectItem(null, full, 'plank')` → `'plank'`; `('plank', full, 'plank')` →
    `null`; `('plank', full, 'shh')` → `'shh'`; with supply
    `{plank: 0, speaker: 1, shh: 1}`: `(null, …, 'plank')` → `null` and
    `('shh', …, 'plank')` → `'shh'`. Inputs unchanged.
28. `dropTargets(L1.hazards, HAZARD_KINDS, S(0), [])` →
    `['cobbles-1', 'neighbour-1', 'bells-1']` in level-file order; with
    `fixedIds ['cobbles-1']` cobbles is missing; with `S(10000)` bells is missing.
29. Tapping a tray button with count > 0 turns its fill `BUTTON_ACTIVE_COLOUR`,
    leaves the count as it was, and outlines exactly the current drop targets
    in `VALID_TILE_COLOUR`. Tapping it again removes highlight and outlines,
    counts unchanged. Tapping another button moves the highlight there. A
    count-0 button can't be selected and leaves the current selection as is.
30. With an item selected, tapping a hazard gives the same result and feedback
    as dropping it there by drag (criteria 17–20); then nothing is selected.
    Tapping a tile with no drop target, or outside the game, uses nothing and
    clears the selection.
31. With an item selected, in `ready`: tapping any tile does not start the
    walk; on level 3, tapping or holding a placed sign does not turn or pick it
    up. With nothing selected, Week 3 and earlier taps behave as before.
32. Selecting an item clears a selected sign and its outlines, and the reverse.
    Starting a drag clears a selected item. Mouse and touch both work.
33. While paused, select and drop work and the selection survives tapping
    **II** and 2x. On `won` the highlight and outlines vanish with the tray; a
    reload starts with nothing selected.

## Phone test checklist (owner)
1. On github.com/Pinzzas/Stroller-God, tap **Actions**: newest run has a green tick.
2. Open https://pinzzas.github.io/Stroller-God/ sideways. Bottom-left you see
   three cream buttons: brown bar "2", dark square "1", white card "1".
3. Before starting, put your finger on the brown bar and slide it around. It
   follows your finger. Over the dark grey-brown square (just before the
   bench) the tile outline is green; over plain grass it's red. The page does
   not scroll. The walk has not started.
4. Let go on the dark grey-brown square: the brown bar stays there, a green
   ring puffs, the button shows "1".
5. Drag the other brown bar onto the gold square (church): it shrinks away,
   the gold square shakes, the button shows "0" and looks faded. Try to drag
   it: nothing happens.
6. Drag the dark square onto the gold square: it stays, green puff.
7. Drag the white card and let go on empty grass: it vanishes, count still "1".
8. Tap empty grass to start. The gold square never pulses. Drag the white card
   onto the lilac square (neighbour) before the stroller passes: it stays and
   the lilac square never pulses or grows.
9. Reload, start, pause with **II**, drop an item, resume: it all still works.
   Wait until the gold square has faded (about 10 s): it now shows a red
   outline and a dropped speaker vanishes unused.
10. Open the `?level=3` link: no tray; signs work as before.
11. Reload level 1. Tap (don't slide) the brown bar: its button turns yellow,
    the count stays "2", three hazard tiles get green outlines. The walk has
    not started. Tap the button again: yellow and outlines go away.
12. Tap the brown bar, then tap the dark grey-brown square: the bar lands
    there with a green puff, the count shows "1", yellow goes away.
13. Tap the dark square button, then tap the white card button: yellow moves
    to the white card. Tap empty grass: yellow goes away, card count still
    "1", walk not started.

## Assumptions (owner, please correct if wrong)
- Choices 1A, 2A, 3A, 4A and 5A above.
- Tap-and-drop is an addition you asked for. DESIGN.md's Controls table only
  lists dragging; once you approve, I'll add "or tap the item, then the tile"
  there.
- The map fills the whole game picture, so "tap outside the grid" mostly means
  a tile with no hazard (choice 4A); a tap beside the game only happens on a
  wide desktop window.
- **II** and 2x keep the selection so you can select, pause, then drop.
- Items go only on a hazard's own tile; anything else is "not here" (red),
  not a wrong match, so nothing is wasted by a slip of the finger.
- A wrong drop wastes the item (DESIGN.md) but leaves the hazard fixable.
- Hazards can be fixed while quiet, warning or going off, but not once `done`.
- The green outline means "a hazard is here", not "this is the right item",
  so the player still has to work out the match.
- Level 1 gets 2 planks, 1 speaker, 1 "Shh" card (spare plank for testing).
- Placeholder shapes hint at use (bar covers a patch, box makes sound, card
  says hush); real "guess it without text" art comes in Week 11.
- Feedback is visual only: no wake meter, no sound this week.
