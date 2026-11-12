import {
  TILE_SIZE,
  TILE_GAP,
  BUTTON_COLOUR,
  BUTTON_TEXT_COLOUR,
  ERROR_ORIGIN,
  SIGN_COUNT_FONT_SIZE,
  SIGN_BUTTON_EMPTY_ALPHA,
  SIGN_FULL_ALPHA,
  VALID_TILE_COLOUR,
  INVALID_TILE_COLOUR,
  DROP_OUTLINE_WIDTH,
  ITEM_TYPES,
  ITEM_KINDS,
  ITEM_BUTTON_SIZE,
  ITEM_TRAY_Y,
  ITEM_TRAY_FIRST_X,
  ITEM_TRAY_SPACING,
  ITEM_COUNT_OFFSET,
  TAP_MOVE_TOLERANCE_PX,
  BUTTON_ACTIVE_COLOUR,
  DEPTH_TAP_OUTLINE,
  DEPTH_BUTTONS,
  DEPTH_TEXTS,
  DEPTH_DRAG,
} from '../config.js';
import { tileToPixel, pixelToTile } from '../logic/tileMath.js';
import { trayItems, traySlotX, pressGesture } from '../logic/items.js';

// A placeholder rectangle for one item, centred on x, y.
export function makeItemShape(scene, type, x, y) {
  const kind = ITEM_KINDS[type];
  return scene.add.rectangle(x, y, kind.width, kind.height, kind.colour);
}

// The item buttons in the bottom-left corner, and the dragging of items out of them.
// A press that barely moves is a tap (onTap); one that moves further becomes a drag.
// callbacks: canDrag(), onPickUp(), onTap(item), isTarget(col, row), onDrop(item, x, y)
export class ItemTray {
  constructor(scene, level, supply, callbacks) {
    this.scene = scene;
    this.level = level;
    this.supply = supply;
    this.callbacks = callbacks;
    this.drag = null;
    this.press = null;
    this.buttons = [];

    this.outline = scene.add
      .rectangle(0, 0, TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP)
      .setStrokeStyle(DROP_OUTLINE_WIDTH, VALID_TILE_COLOUR)
      .setDepth(DEPTH_TAP_OUTLINE)
      .setVisible(false);

    trayItems(supply, ITEM_TYPES).forEach((type, index) => {
      this.buttons.push(this.makeButton(type, traySlotX(index, ITEM_TRAY_FIRST_X, ITEM_TRAY_SPACING)));
    });
    this.refresh(supply);

    // Works for both mouse and touch.
    scene.input.on('pointermove', (pointer) => this.moveDrag(pointer));
    scene.input.on('pointerup', (pointer) => this.endDrag(pointer, true));
    scene.input.on('pointerupoutside', (pointer) => this.endDrag(pointer, false));
  }

  makeButton(type, x) {
    const scene = this.scene;
    const square = scene.add
      .rectangle(x, ITEM_TRAY_Y, ITEM_BUTTON_SIZE, ITEM_BUTTON_SIZE, BUTTON_COLOUR)
      .setDepth(DEPTH_BUTTONS)
      .setInteractive();
    square.on('pointerdown', (pointer) => this.startPress(pointer, type));
    const icon = makeItemShape(scene, type, x, ITEM_TRAY_Y).setDepth(DEPTH_BUTTONS);
    const count = scene.add
      .text(x + ITEM_COUNT_OFFSET, ITEM_TRAY_Y + ITEM_COUNT_OFFSET, '', {
        fontSize: SIGN_COUNT_FONT_SIZE,
        color: BUTTON_TEXT_COLOUR,
      })
      .setOrigin(ERROR_ORIGIN)
      .setDepth(DEPTH_TEXTS);
    return { type, x, square, icon, count };
  }

  // Shows the new counts; an empty button is faded.
  refresh(supply) {
    this.supply = supply;
    for (const button of this.buttons) {
      const alpha = supply[button.type] <= 0 ? SIGN_BUTTON_EMPTY_ALPHA : SIGN_FULL_ALPHA;
      button.square.setAlpha(alpha);
      button.icon.setAlpha(alpha);
      button.count.setText(String(supply[button.type]));
    }
  }

  // Hides the whole tray and ends any drag with nothing used.
  hide() {
    this.press = null;
    this.cancelDrag();
    for (const button of this.buttons) {
      button.square.setVisible(false);
      button.icon.setVisible(false);
      button.count.setVisible(false);
    }
  }

  // Remembers where a press began; it becomes a tap or a drag later.
  startPress(pointer, type) {
    if (this.drag !== null || !this.callbacks.canDrag()) return;
    if (this.supply[type] <= 0) return;
    this.press = { type, pointerId: pointer.id, startX: pointer.worldX, startY: pointer.worldY };
  }

  // Turns the selected item's button yellow (or none).
  showSelected(type) {
    for (const button of this.buttons) {
      button.square.setFillStyle(button.type === type ? BUTTON_ACTIVE_COLOUR : BUTTON_COLOUR);
    }
  }

  startDrag(pointer, type) {
    this.callbacks.onPickUp();
    const shape = makeItemShape(this.scene, type, pointer.worldX, pointer.worldY).setDepth(DEPTH_DRAG);
    this.drag = { type, pointerId: pointer.id, shape };
    this.moveDrag(pointer);
  }

  // The item sits centred on the pointer; the tile under the pointer is outlined.
  moveDrag(pointer) {
    if (this.press !== null && pointer.id === this.press.pointerId) {
      const dx = pointer.worldX - this.press.startX;
      const dy = pointer.worldY - this.press.startY;
      if (pressGesture(dx, dy, TAP_MOVE_TOLERANCE_PX) === 'drag') {
        const { type } = this.press;
        this.press = null;
        this.startDrag(pointer, type);
      }
    }
    if (this.drag === null || pointer.id !== this.drag.pointerId) return;
    const x = pointer.worldX;
    const y = pointer.worldY;
    this.drag.shape.setPosition(x, y);
    const tile = this.overTray(x, y) ? null : pixelToTile(x, y, TILE_SIZE, this.level.cols, this.level.rows);
    if (tile === null) {
      this.outline.setVisible(false);
      return;
    }
    const centre = tileToPixel(tile.col, tile.row, TILE_SIZE);
    const colour = this.callbacks.isTarget(tile.col, tile.row) ? VALID_TILE_COLOUR : INVALID_TILE_COLOUR;
    this.outline.setPosition(centre.x, centre.y).setStrokeStyle(DROP_OUTLINE_WIDTH, colour).setVisible(true);
  }

  endDrag(pointer, insideGame) {
    if (this.press !== null && pointer.id === this.press.pointerId) {
      const { type } = this.press;
      this.press = null;
      if (insideGame) this.callbacks.onTap(type);
      return;
    }
    if (this.drag === null || pointer.id !== this.drag.pointerId) return;
    const { type } = this.drag;
    this.cancelDrag();
    if (insideGame && !this.overTray(pointer.worldX, pointer.worldY)) {
      this.callbacks.onDrop(type, pointer.worldX, pointer.worldY);
    }
  }

  // Removes the dragged item and the outline. Nothing is used.
  cancelDrag() {
    if (this.drag === null) return;
    this.drag.shape.destroy();
    this.drag = null;
    this.outline.setVisible(false);
  }

  overTray(x, y) {
    const half = ITEM_BUTTON_SIZE / 2;
    if (Math.abs(y - ITEM_TRAY_Y) > half) return false;
    return this.buttons.some((button) => Math.abs(x - button.x) <= half);
  }
}
