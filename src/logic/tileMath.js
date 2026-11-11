// Centre of a tile in pixels.
export function tileToPixel(col, row, tileSize) {
  return { x: col * tileSize + tileSize / 2, y: row * tileSize + tileSize / 2 };
}

// Which tile a pixel is in, or null when outside the grid.
export function pixelToTile(x, y, tileSize, cols, rows) {
  const col = Math.floor(x / tileSize);
  const row = Math.floor(y / tileSize);
  if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
  return { col, row };
}
