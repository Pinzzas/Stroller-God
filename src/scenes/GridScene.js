import Phaser from 'phaser';
import {
  TILE_SIZE,
  TILE_GAP,
  GAME_WIDTH,
  GAME_HEIGHT,
  BG_COLOUR,
  GRASS_COLOUR,
  PATH_COLOUR,
  START_COLOUR,
  FINISH_COLOUR,
  HIGHLIGHT_COLOUR,
  HIGHLIGHT_WIDTH,
  ERROR_FONT_SIZE,
  ERROR_COLOUR,
  ERROR_ORIGIN,
  WALK_SPEED,
  NORMAL_SPEED_MULTIPLIER,
  FAST_SPEED_MULTIPLIER,
  PARENT_TRAIL_TILES,
  STROLLER_SIZE,
  STROLLER_COLOUR,
  PARENT_SIZE,
  PARENT_COLOUR,
  MESSAGE_Y,
  MESSAGE_FONT_SIZE,
  MESSAGE_COLOUR,
  START_HINT_TEXT,
  WIN_TEXT,
  PAUSE_KEY,
  SPEED_KEY,
  BUTTON_SIZE,
  BUTTON_Y,
  PAUSE_BUTTON_X,
  SPEED_BUTTON_X,
  BUTTON_COLOUR,
  BUTTON_ACTIVE_COLOUR,
  BUTTON_FONT_SIZE,
  BUTTON_TEXT_COLOUR,
  PAUSE_LABEL,
  RESUME_LABEL,
  SPEED_LABEL_NORMAL,
  SPEED_LABEL_FAST,
  WAIT_SIGN_MS,
  LONG_PRESS_MS,
  SIGN_TYPES,
  ARROW_DIRECTIONS,
  SIGN_SIZE,
  SIGN_ARROW_COLOUR,
  SIGN_WAIT_COLOUR,
  VALID_TILE_COLOUR,
  VALID_TILE_WIDTH,
  ARROW_BUTTON_X,
  WAIT_BUTTON_X,
  SIGN_COUNT_FONT_SIZE,
  SIGN_COUNT_OFFSET,
  SIGN_BUTTON_EMPTY_ALPHA,
  SIGN_FULL_ALPHA,
  LEVEL_IDS,
  DEFAULT_LEVEL_ID,
  HAZARD_KINDS,
  HAZARD_WARNING_MS,
  TIMED_ACTIVE_MS,
  TRIGGER_RADIUS_TILES,
  TRIGGER_WARNING_RADIUS_TILES,
  ROAM_SPEED,
  HAZARD_SIZE,
  HAZARD_ACTIVE_SCALE,
  HAZARD_DONE_ALPHA,
  HAZARD_RING_COLOUR,
  HAZARD_RING_RADIUS,
  HAZARD_RING_WIDTH,
  WARNING_PULSE_MS,
  WARNING_PULSE_SCALE,
  DEPTH_HAZARDS,
  DEPTH_TILES,
  DEPTH_VALID_OUTLINES,
  DEPTH_SIGNS,
  DEPTH_TAP_OUTLINE,
  DEPTH_WALKERS,
  DEPTH_BUTTONS,
  DEPTH_TEXTS,
} from '../config.js';
import level01 from '../../levels/level-01.json';
import level03 from '../../levels/level-03.json';
import { parseLevel } from '../logic/parseLevel.js';
import { validateLevel } from '../logic/validateLevel.js';
import { tileToPixel, pixelToTile } from '../logic/tileMath.js';
import { findPath } from '../logic/findPath.js';
import { reroute } from '../logic/route.js';
import { signAt, canPlaceSign, placeSign, rotateArrow, pickUpSign, pressKind } from '../logic/signs.js';
import { updateHazards, pulseScale } from '../logic/hazards.js';
import { levelIdFromUrl } from '../logic/levelChoice.js';
import {
  stepWalk,
  pointOnPath,
  hasArrived,
  advanceTime,
  togglePause,
  toggleSpeed,
} from '../logic/walking.js';

const LEVEL_FILES = { 'level-01': level01, 'level-03': level03 };
const SIGN_BUTTON_XS = { arrow: ARROW_BUTTON_X, wait: WAIT_BUTTON_X };

const HAZARD_TUNING = {
  warningMs: HAZARD_WARNING_MS,
  timedActiveMs: TIMED_ACTIVE_MS,
  triggerRadius: TRIGGER_RADIUS_TILES,
  warningRadius: TRIGGER_WARNING_RADIUS_TILES,
  roamSpeed: ROAM_SPEED,
};

const TILE_COLOURS = {
  grass: GRASS_COLOUR,
  path: PATH_COLOUR,
  start: START_COLOUR,
  finish: FINISH_COLOUR,
};

// Draws the level, walks the parent and stroller along the path, and outlines the tapped tile.
export class GridScene extends Phaser.Scene {
  constructor() {
    super('GridScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(BG_COLOUR);

    const levelId = levelIdFromUrl(window.location.search, LEVEL_IDS, DEFAULT_LEVEL_ID);
    const levelJson = LEVEL_FILES[levelId];
    const problems = validateLevel(levelJson);
    if (problems.length > 0) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Level error: ${problems[0]}`, {
          fontSize: ERROR_FONT_SIZE,
          color: ERROR_COLOUR,
        })
        .setOrigin(ERROR_ORIGIN);
      return;
    }

    this.level = parseLevel(levelJson);
    this.signs = [];
    this.supply = { arrow: 0, wait: 0 };
    for (const type of SIGN_TYPES) this.supply[type] = (levelJson.signs && levelJson.signs[type]) || 0;
    this.selected = null;
    this.press = null;
    this.signObjects = [];
    this.validOutlines = [];
    this.input.mouse.disableContextMenu();
    this.drawTiles();

    this.outline = this.add
      .rectangle(0, 0, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP)
      .setStrokeStyle(HIGHLIGHT_WIDTH, HIGHLIGHT_COLOUR)
      .setDepth(DEPTH_TAP_OUTLINE)
      .setVisible(false);

    this.path = findPath(this.level);
    this.state = 'ready';
    this.multiplier = NORMAL_SPEED_MULTIPLIER;
    this.walker = { distance: 0, waitLeftMs: 0, waitedIndex: 0 };

    this.parent = this.add.rectangle(0, 0, PARENT_SIZE, PARENT_SIZE, PARENT_COLOUR).setDepth(DEPTH_WALKERS);
    this.stroller = this.add.rectangle(0, 0, STROLLER_SIZE, STROLLER_SIZE, STROLLER_COLOUR).setDepth(DEPTH_WALKERS);
    this.placeWalker(0);

    this.walkMs = 0;
    this.hazardStates = null;
    this.hazardObjects = this.level.hazards.map((hazard) => this.makeHazardObject(hazard));
    this.refreshHazards();

    this.pauseButton = this.makeButton(PAUSE_BUTTON_X, PAUSE_LABEL, () => this.pressPause());
    this.speedButton = this.makeButton(SPEED_BUTTON_X, SPEED_LABEL_NORMAL, () => this.pressSpeed());
    this.showButtons(false);

    this.signButtons = {};
    for (const type of SIGN_TYPES) {
      if (this.supply[type] > 0) this.signButtons[type] = this.makeSignButton(type);
    }
    this.redrawSigns();

    this.message = this.add
      .text(GAME_WIDTH / 2, MESSAGE_Y, START_HINT_TEXT, {
        fontSize: MESSAGE_FONT_SIZE,
        color: MESSAGE_COLOUR,
      })
      .setOrigin(ERROR_ORIGIN)
      .setDepth(DEPTH_TEXTS);

    // Works for both mouse and touch. Taps that land on a button are skipped here.
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) return;
      this.handleTap(pointer.worldX, pointer.worldY);
    });
    // A finger or mouse lifted after pressing a sign: short press turns it, long press picks it up.
    this.input.on('pointerup', (pointer) => {
      if (this.press === null) return;
      const { col, row, downTime } = this.press;
      this.press = null;
      if (this.state === 'won') return;
      if (pressKind(pointer.upTime - downTime, LONG_PRESS_MS) === 'long') {
        this.changeSigns(pickUpSign(this.signs, this.supply, col, row));
      } else {
        this.changeSigns({ signs: rotateArrow(this.level, this.signs, col, row), supply: this.supply });
      }
    });
    this.input.keyboard.addKey(PAUSE_KEY).on('down', () => this.pressPause());
    this.input.keyboard.addKey(SPEED_KEY).on('down', () => this.pressSpeed());
  }

  update(time, delta) {
    if (this.hazardObjects) this.animateRings(time);
    if (this.state !== 'walking') return;
    const deltaMs = advanceTime(0, delta, this.state, this.multiplier);
    this.walkMs += deltaMs;
    this.walker = stepWalk(this.walker, deltaMs, WALK_SPEED, this.path, this.signs, WAIT_SIGN_MS);
    this.placeWalker(this.walker.distance);
    this.refreshHazards();
    if (hasArrived(this.walker.distance, this.path.length)) {
      this.state = 'won';
      this.showButtons(false);
      this.selected = null;
      this.refreshSignButtons();
      this.refreshValidOutlines();
      this.message.setText(WIN_TEXT).setVisible(true);
    }
  }

  handleTap(x, y) {
    if (this.selected !== null && this.state !== 'won') {
      const tile = pixelToTile(x, y, TILE_SIZE, this.level.cols, this.level.rows);
      if (tile !== null && canPlaceSign(this.level, this.signs, this.supply, this.selected, tile.col, tile.row)) {
        const result = placeSign(this.level, this.signs, this.supply, this.selected, tile.col, tile.row);
        this.selected = null;
        this.changeSigns(result);
      }
      return;
    }
    if (this.state === 'ready') {
      this.state = 'walking';
      this.message.setVisible(false);
      this.showButtons(true);
      return;
    }
    this.highlightTileAt(x, y);
  }

  pressPause() {
    this.state = togglePause(this.state);
    this.pauseButton.label.setText(this.state === 'paused' ? RESUME_LABEL : PAUSE_LABEL);
  }

  pressSpeed() {
    if (this.state !== 'walking' && this.state !== 'paused') return;
    this.multiplier = toggleSpeed(this.multiplier, NORMAL_SPEED_MULTIPLIER, FAST_SPEED_MULTIPLIER);
    const fast = this.multiplier === FAST_SPEED_MULTIPLIER;
    this.speedButton.label.setText(fast ? SPEED_LABEL_FAST : SPEED_LABEL_NORMAL);
    this.speedButton.square.setFillStyle(fast ? BUTTON_ACTIVE_COLOUR : BUTTON_COLOUR);
  }

  // Stores new signs and counts, plans the route again and redraws.
  changeSigns(result) {
    if (this.state === 'won') return;
    this.signs = result.signs;
    this.supply = result.supply;
    this.path = reroute(this.level, this.signs, this.path, this.walker.distance);
    this.placeWalker(this.walker.distance);
    this.redrawSigns();
  }

  makeSignButton(type) {
    const x = SIGN_BUTTON_XS[type];
    const square = this.add
      .rectangle(x, BUTTON_Y, BUTTON_SIZE, BUTTON_SIZE, BUTTON_COLOUR)
      .setDepth(DEPTH_BUTTONS)
      .setInteractive();
    square.on('pointerdown', () => {
      if (this.state === 'won' || this.supply[type] <= 0) return;
      this.selected = this.selected === type ? null : type;
      this.refreshSignButtons();
      this.refreshValidOutlines();
    });
    const icon = this.makeSignShape(type, ARROW_DIRECTIONS[0], x, BUTTON_Y).setDepth(DEPTH_BUTTONS);
    const count = this.add
      .text(x + SIGN_COUNT_OFFSET, BUTTON_Y + SIGN_COUNT_OFFSET, '', {
        fontSize: SIGN_COUNT_FONT_SIZE,
        color: BUTTON_TEXT_COLOUR,
      })
      .setOrigin(ERROR_ORIGIN)
      .setDepth(DEPTH_TEXTS);
    return { square, icon, count };
  }

  // A teal triangle pointing in dir (arrow) or an orange-red circle (wait).
  makeSignShape(type, dir, x, y) {
    if (type === 'wait') return this.add.circle(x, y, SIGN_SIZE / 2, SIGN_WAIT_COLOUR);
    const triangle = this.add.triangle(
      x, y,
      SIGN_SIZE / 2, 0,
      SIGN_SIZE, SIGN_SIZE,
      0, SIGN_SIZE,
      SIGN_ARROW_COLOUR
    );
    return triangle.setRotation((ARROW_DIRECTIONS.indexOf(dir) * Math.PI) / 2);
  }

  refreshSignButtons() {
    for (const type of Object.keys(this.signButtons)) {
      const button = this.signButtons[type];
      const visible = this.state !== 'won';
      const empty = this.supply[type] <= 0;
      button.square.setVisible(visible);
      button.icon.setVisible(visible);
      button.count.setVisible(visible).setText(String(this.supply[type]));
      button.square.setFillStyle(this.selected === type ? BUTTON_ACTIVE_COLOUR : BUTTON_COLOUR);
      const alpha = empty ? SIGN_BUTTON_EMPTY_ALPHA : SIGN_FULL_ALPHA;
      button.square.setAlpha(alpha);
      button.icon.setAlpha(alpha);
    }
  }

  // Green outlines on every tile where the selected sign fits.
  refreshValidOutlines() {
    this.validOutlines.forEach((outline) => outline.destroy());
    this.validOutlines = [];
    if (this.selected === null) return;
    this.level.tiles.forEach((line, row) => {
      line.forEach((name, col) => {
        if (!canPlaceSign(this.level, this.signs, this.supply, this.selected, col, row)) return;
        const { x, y } = tileToPixel(col, row, TILE_SIZE);
        const outline = this.add
          .rectangle(x, y, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP)
          .setStrokeStyle(VALID_TILE_WIDTH, VALID_TILE_COLOUR)
          .setDepth(DEPTH_VALID_OUTLINES);
        this.validOutlines.push(outline);
      });
    });
  }

  // Redraws every placed sign, the buttons and the green outlines.
  redrawSigns() {
    this.signObjects.forEach((object) => object.destroy());
    this.signObjects = [];
    for (const sign of this.signs) {
      const { x, y } = tileToPixel(sign.col, sign.row, TILE_SIZE);
      const shape = this.makeSignShape(sign.type, sign.dir, x, y).setDepth(DEPTH_SIGNS);
      shape.setInteractive();
      shape.on('pointerdown', (pointer) => this.pressSign(pointer, sign));
      this.signObjects.push(shape);
    }
    if (this.selected !== null && this.supply[this.selected] <= 0) this.selected = null;
    this.refreshSignButtons();
    this.refreshValidOutlines();
  }

  // Right-click picks up at once; otherwise wait for the release to tell tap from long press.
  pressSign(pointer, sign) {
    if (this.state === 'won') return;
    if (pointer.rightButtonDown()) {
      this.changeSigns(pickUpSign(this.signs, this.supply, sign.col, sign.row));
      return;
    }
    this.press = { col: sign.col, row: sign.row, downTime: pointer.downTime };
  }

  makeButton(x, labelText, onPress) {
    const square = this.add
      .rectangle(x, BUTTON_Y, BUTTON_SIZE, BUTTON_SIZE, BUTTON_COLOUR)
      .setDepth(DEPTH_BUTTONS)
      .setInteractive();
    square.on('pointerdown', onPress);
    const label = this.add
      .text(x, BUTTON_Y, labelText, { fontSize: BUTTON_FONT_SIZE, color: BUTTON_TEXT_COLOUR })
      .setOrigin(ERROR_ORIGIN)
      .setDepth(DEPTH_TEXTS);
    return { square, label };
  }

  showButtons(visible) {
    for (const button of [this.pauseButton, this.speedButton]) {
      button.square.setVisible(visible);
      button.label.setVisible(visible);
    }
  }

  makeHazardObject(hazard) {
    const colour = HAZARD_KINDS[hazard.kind].colour;
    const square = this.add.rectangle(0, 0, HAZARD_SIZE, HAZARD_SIZE, colour).setDepth(DEPTH_HAZARDS);
    const ring = this.add
      .circle(0, 0, HAZARD_RING_RADIUS)
      .setStrokeStyle(HAZARD_RING_WIDTH, HAZARD_RING_COLOUR)
      .setDepth(DEPTH_HAZARDS)
      .setVisible(false);
    return { square, ring };
  }

  // Recomputes every hazard's state from the walk clock and the stroller, then draws it.
  refreshHazards() {
    const stroller = pointOnPath(this.path, this.walker.distance);
    this.hazardStates = updateHazards(
      this.level.hazards, HAZARD_KINDS, this.hazardStates, this.walkMs, stroller, HAZARD_TUNING
    );
    this.hazardStates.forEach((hazard, i) => {
      const { square, ring } = this.hazardObjects[i];
      const { x, y } = tileToPixel(hazard.col, hazard.row, TILE_SIZE);
      const type = HAZARD_KINDS[this.level.hazards[i].kind].type;
      const goingOff = hazard.state === 'active' && (type === 'triggered' || type === 'timed');
      square.setPosition(x, y);
      square.setScale(goingOff ? HAZARD_ACTIVE_SCALE : 1);
      square.setAlpha(hazard.state === 'done' ? HAZARD_DONE_ALPHA : 1);
      ring.setPosition(x, y);
      ring.setVisible(hazard.state === 'warning' || goingOff);
      ring.setData('warning', hazard.state === 'warning');
    });
  }

  // The warning ring pulses; the going-off ring stays solid. Only an animation.
  animateRings(time) {
    const scale = pulseScale(time, WARNING_PULSE_MS, WARNING_PULSE_SCALE);
    for (const { ring } of this.hazardObjects) {
      ring.setScale(ring.getData('warning') ? scale : HAZARD_ACTIVE_SCALE);
    }
  }

  // Puts the stroller at the given distance along the path and the parent just behind it.
  placeWalker(distance) {
    const front = pointOnPath(this.path, distance);
    const back = pointOnPath(this.path, distance - PARENT_TRAIL_TILES);
    const frontPixel = tileToPixel(front.col, front.row, TILE_SIZE);
    const backPixel = tileToPixel(back.col, back.row, TILE_SIZE);
    this.stroller.setPosition(frontPixel.x, frontPixel.y);
    this.parent.setPosition(backPixel.x, backPixel.y);
  }

  drawTiles() {
    this.level.tiles.forEach((line, row) => {
      line.forEach((name, col) => {
        const { x, y } = tileToPixel(col, row, TILE_SIZE);
        this.add
          .rectangle(x, y, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP, TILE_COLOURS[name])
          .setDepth(DEPTH_TILES);
      });
    });
  }

  highlightTileAt(x, y) {
    const tile = pixelToTile(x, y, TILE_SIZE, this.level.cols, this.level.rows);
    if (tile === null) return;
    const centre = tileToPixel(tile.col, tile.row, TILE_SIZE);
    this.outline.setPosition(centre.x, centre.y).setVisible(true);
  }
}
