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
} from '../config.js';
import level01 from '../../levels/level-01.json';
import { parseLevel } from '../logic/parseLevel.js';
import { validateLevel } from '../logic/validateLevel.js';
import { tileToPixel, pixelToTile } from '../logic/tileMath.js';

const TILE_COLOURS = {
  grass: GRASS_COLOUR,
  path: PATH_COLOUR,
  start: START_COLOUR,
  finish: FINISH_COLOUR,
};

// Draws the level as coloured squares and outlines the tapped tile.
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

    // Works for both mouse and touch.
    this.input.on('pointerdown', (pointer) => this.highlightTileAt(pointer.worldX, pointer.worldY));
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
