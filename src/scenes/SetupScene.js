import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BG_COLOUR,
  SQUARE_SIZE,
  SQUARE_COLOURS,
  TITLE_TEXT,
  TITLE_Y,
  TITLE_FONT_SIZE,
  TITLE_COLOUR,
} from '../config.js';
import { nextColourIndex } from '../logic/nextColourIndex.js';

// Placeholder scene: a square that changes colour when tapped or clicked.
export class SetupScene extends Phaser.Scene {
  constructor() {
    super('SetupScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(BG_COLOUR);

    this.add
      .text(GAME_WIDTH / 2, TITLE_Y, TITLE_TEXT, {
        fontSize: TITLE_FONT_SIZE,
        color: TITLE_COLOUR,
      })
      .setOrigin(0.5);

    this.colourIndex = 0;
    this.square = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_COLOURS[this.colourIndex]
    );
    this.square.setInteractive();
    this.square.on('pointerdown', () => {
      this.colourIndex = nextColourIndex(this.colourIndex, SQUARE_COLOURS.length);
      this.square.setFillStyle(SQUARE_COLOURS[this.colourIndex]);
    });
  }
}
