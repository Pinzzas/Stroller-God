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

// Week 2: walking
export const WALK_SPEED = 1; // tiles per second at normal speed
export const NORMAL_SPEED_MULTIPLIER = 1; // speed multiplier at 1x
export const FAST_SPEED_MULTIPLIER = 2; // speed multiplier at 2x
export const PARENT_TRAIL_TILES = 0.5; // how far the parent walks behind the stroller, in tiles
export const STROLLER_SIZE = 32; // stroller square, pixels
export const STROLLER_COLOUR = 0xf2a7c3; // soft pink
export const PARENT_SIZE = 24; // parent square, pixels
export const PARENT_COLOUR = 0x4a5a7a; // dark slate blue

export const MESSAGE_Y = 64; // text centre height (middle of the empty top rows)
export const MESSAGE_FONT_SIZE = '32px'; // hint and win text size
export const MESSAGE_COLOUR = '#4a3b2a'; // warm dark brown
export const START_HINT_TEXT = 'Tap to start walking'; // shown before the walk
export const WIN_TEXT = 'Made it to the park bench!'; // shown on arrival

export const PAUSE_KEY = 'SPACE'; // keyboard key for pause / resume
export const SPEED_KEY = 'F'; // keyboard key for 1x / 2x

export const BUTTON_SIZE = 80; // button square, pixels
export const BUTTON_Y = 64; // centre height of both buttons
export const PAUSE_BUTTON_X = 864; // centre x of the pause button
export const SPEED_BUTTON_X = 960; // centre x of the speed button
export const BUTTON_COLOUR = 0xfff7e6; // pale cream button
export const BUTTON_ACTIVE_COLOUR = 0xf5d36b; // yellow: 2x is on
export const BUTTON_FONT_SIZE = '28px'; // button label size
export const BUTTON_TEXT_COLOUR = '#4a3b2a'; // warm dark brown
export const PAUSE_LABEL = 'II'; // pause button label while walking
export const RESUME_LABEL = '>'; // pause button label while paused
export const SPEED_LABEL_NORMAL = '1x'; // speed button label at 1x
export const SPEED_LABEL_FAST = '2x'; // speed button label at 2x

// Week 3: signs at junctions
export const WAIT_SIGN_MS = 3000; // how long the parent stops at a wait sign (walk-clock time)
export const LONG_PRESS_MS = 500; // hold this long to pick a sign up on touch
export const SIGN_TYPES = ['arrow', 'wait']; // allowed keys in a level's "signs" field
export const ARROW_DIRECTIONS = ['up', 'right', 'down', 'left']; // clockwise order
export const SIGN_SIZE = 40; // sign size on a tile and on its button, pixels
export const SIGN_ARROW_COLOUR = 0x3f8f8a; // teal triangle
export const SIGN_WAIT_COLOUR = 0xe0703a; // orange-red circle
export const VALID_TILE_COLOUR = 0x5fbf5f; // green outline where the selected sign fits
export const VALID_TILE_WIDTH = 4; // green outline thickness in pixels
export const ARROW_BUTTON_X = 64; // centre x of the arrow button
export const WAIT_BUTTON_X = 160; // centre x of the wait button
export const SIGN_COUNT_FONT_SIZE = '20px'; // count number on a sign button
export const SIGN_COUNT_OFFSET = 24; // count sits this far right of and below the button centre
export const SIGN_BUTTON_EMPTY_ALPHA = 0.4; // faded look when the count is 0
export const SIGN_FULL_ALPHA = 1; // normal look of a sign button
export const LEVEL_URL_PARAM = 'level'; // name in the link, e.g. ?level=3
export const LEVEL_IDS = { 1: 'level-01', 3: 'level-03' }; // which file each number opens
export const DEFAULT_LEVEL_ID = 'level-01'; // opened when the link has no or an unknown number

// Draw order, bottom to top
export const DEPTH_TILES = 0;
export const DEPTH_VALID_OUTLINES = 1;
export const DEPTH_SIGNS = 2;
export const DEPTH_TAP_OUTLINE = 3;
export const DEPTH_WALKERS = 4;
export const DEPTH_BUTTONS = 5;
export const DEPTH_TEXTS = 6;
