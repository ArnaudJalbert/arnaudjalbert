import { addLink, LINKED_CORNERS, linkState } from "./links";
import { fillWhite, type TileStyle } from "./tile-style";

const isEven = (value: number) => ((value % 2) + 2) % 2 === 0;

// Grid vertices alternate black and white. The links split each tile into the two corner
// pieces they wrap and the band between them, and every piece takes the color of the
// vertices it touches, so white regions wind across tiles. Fully pinched, the pieces are
// four checkerboard quarters, the same in both orientations.
export const blobs: TileStyle = {
  orientations: 2,
  addTile: (path, tile) => {
    const { orientation, pinch } = linkState(tile);
    const { x, y } = tile;
    const half = tile.size / 2;
    const [first, second] = LINKED_CORNERS[orientation];
    if (isEven(tile.column + tile.row + orientation)) {
      // White corner pieces.
      for (const corner of [first, second]) {
        path.moveTo(x + corner[0] * half, y + corner[1] * half);
        path.lineTo(x, y + corner[1] * half);
        addLink(path, tile, corner, pinch);
        path.closePath();
      }
    } else {
      // White band between them.
      path.moveTo(x, y + first[1] * half);
      addLink(path, tile, first, pinch);
      path.lineTo(x + first[0] * half, y + second[1] * half);
      path.lineTo(x, y + second[1] * half);
      addLink(path, tile, second, pinch);
      path.lineTo(x + second[0] * half, y + first[1] * half);
      path.closePath();
    }
  },
  paint: fillWhite,
};
