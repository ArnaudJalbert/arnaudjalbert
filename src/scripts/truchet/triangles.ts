import { CLOCKWISE_CORNERS, fillWhite, wrap, type TileStyle } from "./tile-style";

const cornerAt = (index: number) => CLOCKWISE_CORNERS[wrap(index, 4)];

// The white half of the tile spans three corners, clockwise from the orientation.
// A flip slides one of them along a tile edge to the fourth corner: the first one when
// turning clockwise, the last one when turning back.
export const triangles: TileStyle = {
  orientations: 4,
  addTile: (path, tile) => {
    const half = tile.size / 2;
    const from = tile.orientation - tile.direction;
    const points = [cornerAt(from), cornerAt(from + 1), cornerAt(from + 2)];
    const sliding = tile.direction === 1 ? 0 : 2;
    const [startX, startY] = points[sliding];
    const [endX, endY] = cornerAt(from + 3);
    points[sliding] = [startX + (endX - startX) * tile.progress, startY + (endY - startY) * tile.progress];
    path.moveTo(tile.x + points[0][0] * half, tile.y + points[0][1] * half);
    path.lineTo(tile.x + points[1][0] * half, tile.y + points[1][1] * half);
    path.lineTo(tile.x + points[2][0] * half, tile.y + points[2][1] * half);
    path.closePath();
  },
  paint: fillWhite,
};
