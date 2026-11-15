import { fillWhite, shrinkThenGrow, type TileStyle } from "./tile-style";

// Edge midpoints clockwise from the top, as signs relative to the tile center.
const EDGES = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

// A white half disk standing on one tile edge. Neighbors on both sides of an edge join
// into circles, and runs of them into capsules.
export const arches: TileStyle = {
  orientations: 4,
  addTile: (path, tile) => {
    const { orientation, scale } = shrinkThenGrow(tile, 4);
    if (scale === 0) return;
    const half = tile.size / 2;
    const [signX, signY] = EDGES[orientation];
    const centerX = tile.x + signX * half;
    const centerY = tile.y + signY * half;
    const radius = half * scale;
    const start = (orientation * Math.PI) / 2;
    path.moveTo(centerX + Math.cos(start) * radius, centerY + Math.sin(start) * radius);
    path.arc(centerX, centerY, radius, start, start + Math.PI);
    path.closePath();
  },
  paint: fillWhite,
};
