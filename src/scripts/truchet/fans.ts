import { CLOCKWISE_CORNERS, fillWhite, shrinkThenGrow, type TileStyle } from "./tile-style";

// A white quarter disk filling the tile from one corner. Four fans facing each other
// across a grid vertex make a full circle.
export const fans: TileStyle = {
  orientations: 4,
  addTile: (path, tile) => {
    const { orientation, scale } = shrinkThenGrow(tile, 4);
    if (scale === 0) return;
    const [signX, signY] = CLOCKWISE_CORNERS[orientation];
    const cornerX = tile.x + signX * (tile.size / 2);
    const cornerY = tile.y + signY * (tile.size / 2);
    const start = (orientation * Math.PI) / 2;
    path.moveTo(cornerX, cornerY);
    path.arc(cornerX, cornerY, tile.size * scale, start, start + Math.PI / 2);
    path.closePath();
  },
  paint: fillWhite,
};
