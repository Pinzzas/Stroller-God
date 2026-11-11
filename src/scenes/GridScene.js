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
} from '../config.js';
import level01 from '../../levels/level-01.json';
import { parseLevel } from '../logic/parseLevel.js';
import { validateLevel } from '../logic/validateLevel.js';
import { tileToPixel, pixelToTile } from '../logic/tileMath.js';
import { findPath } from '../logic/findPath.js';
import {
  walkProgress,
  pointOnPath,
  hasArrived,
  advanceTime,
  togglePause,
  toggleSpeed,
} from '../logic/walking.js';

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

    const problems = validateLevel(level01);
    if (problems.length > 0) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Level error: ${problems[0]}`, {
          fontSize: ERROR_FONT_SIZE,
          color: ERROR_COLOUR,
        })
        .setOrigin(ERROR_ORIGIN);
      return;
    }

    this.level = parseLevel(level01);
    this.drawTiles();

    this.outline = this.add
      .rectangle(0, 0, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP)
      .setStrokeStyle(HIGHLIGHT_WIDTH, HIGHLIGHT_COLOUR)
      .setVisible(false);

    this.path = findPath(this.level);
    this.state = 'ready';
    this.multiplier = NORMAL_SPEED_MULTIPLIER;
    this.elapsed = 0;

    this.parent = this.add.rectangle(0, 0, PARENT_SIZE, PARENT_SIZE, PARENT_COLOUR);
    this.stroller = this.add.rectangle(0, 0, STROLLER_SIZE, STROLLER_SIZE, STROLLER_COLOUR);
    this.placeWalker(0);

    this.pauseButton = this.makeButton(PAUSE_BUTTON_X, PAUSE_LABEL, () => this.pressPause());
    this.speedButton = this.makeButton(SPEED_BUTTON_X, SPEED_LABEL_NORMAL, () => this.pressSpeed());
    this.showButtons(false);

    this.message = this.add
      .text(GAME_WIDTH / 2, MESSAGE_Y, START_HINT_TEXT, {
        fontSize: MESSAGE_FONT_SIZE,
        color: MESSAGE_COLOUR,
      })
      .setOrigin(ERROR_ORIGIN);

    // Works for both mouse and touch. Taps that land on a button are skipped here.
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) return;
      this.handleTap(pointer.worldX, pointer.worldY);
    });
    this.input.keyboard.addKey(PAUSE_KEY).on('down', () => this.pressPause());
    this.input.keyboard.addKey(SPEED_KEY).on('down', () => this.pressSpeed());
  }

  update(time, delta) {
    if (this.state !== 'walking') return;
    this.elapsed = advanceTime(this.elapsed, delta, this.state, this.multiplier);
    const distance = walkProgress(this.elapsed, WALK_SPEED, this.path.length);
    this.placeWalker(distance);
    if (hasArrived(distance, this.path.length)) {
      this.state = 'won';
      this.showButtons(false);
      this.message.setText(WIN_TEXT).setVisible(true);
    }
  }

  handleTap(x, y) {
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

  makeButton(x, labelText, onPress) {
    const square = this.add
      .rectangle(x, BUTTON_Y, BUTTON_SIZE, BUTTON_SIZE, BUTTON_COLOUR)
      .setInteractive();
    square.on('pointerdown', onPress);
    const label = this.add
      .text(x, BUTTON_Y, labelText, { fontSize: BUTTON_FONT_SIZE, color: BUTTON_TEXT_COLOUR })
      .setOrigin(ERROR_ORIGIN);
    return { square, label };
  }

  showButtons(visible) {
    for (const button of [this.pauseButton, this.speedButton]) {
      button.square.setVisible(visible);
      button.label.setVisible(visible);
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
        this.add.rectangle(x, y, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP, TILE_COLOURS[name]);
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
