// All tuning numbers and colours live here.
export const TILE_SIZE = 64; // pixels per tile
export const GRID_COLS = 16; // tiles across
export const GRID_ROWS = 9; // tiles down
export const GAME_WIDTH = TILE_SIZE * GRID_COLS; // 1024
export const GAME_HEIGHT = TILE_SIZE * GRID_ROWS; // 576

export const BG_COLOUR = 0xf3ead8; // warm cream background

export const TILE_GAP = 2; // pixels of cream between tiles
export const TILE_SYMBOLS = { '.': 'grass', '#': 'path', S: 'start', F: 'finish' }; // level file characters
export const WALKABLE_TILES = ['path', 'start', 'finish']; // tiles the parent can walk on

export const GRASS_COLOUR = 0x9ccf8f; // soft green
export const PATH_COLOUR = 0xd9c7a3; // cobblestone beige
export const START_COLOUR = 0x7fb2e5; // blue (home)
export const FINISH_COLOUR = 0xf5d36b; // yellow (park bench)

export const HIGHLIGHT_COLOUR = 0xffffff; // tapped-tile outline
export const HIGHLIGHT_WIDTH = 4; // outline thickness in pixels

export const ERROR_FONT_SIZE = '24px'; // level error text
export const ERROR_COLOUR = '#a33a2b'; // level error text colour
export const ERROR_ORIGIN = 0.5; // centre the error text on its position
