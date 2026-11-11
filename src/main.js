import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, BG_COLOUR } from './config.js';
import { GridScene } from './scenes/GridScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: BG_COLOUR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GridScene],
});
