import { OPPOSITE_CORNERS, strokeWhite, type TileStyle } from "./tile-style";

// A thick line between opposite corners, so lines meet at grid vertices and form a maze.
// A flip slides the top end along the top edge and the bottom end along the bottom edge,
// passing through a vertical line halfway.
export const diagonals: TileStyle = {
  orientations: 2,
  addTile: (path, tile) => {
    const half = tile.size / 2;
    const from = OPPOSITE_CORNERS[1 - tile.orientation];
    const to = OPPOSITE_CORNERS[tile.orientation];
    const [top, bottom] = [0, 1].map((end) => from[end][0] + (to[end][0] - from[end][0]) * tile.progress);
    path.moveTo(tile.x + top * half, tile.y - half);
    path.lineTo(tile.x + bottom * half, tile.y + half);
  },
  paint: (context, path, size) => strokeWhite(context, path, size / 4, "round"),
};
