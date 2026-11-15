import { OPPOSITE_CORNERS, type Corner, type PlacedTile } from "./tile-style";

// Shared by lines and blobs. Orientation 0 links the top and left edge midpoints, and the
// bottom and right ones. Orientation 1 links top with right and bottom with left. Each link
// is a quarter arc around the corner between its two midpoints.
export const LINKED_CORNERS = OPPOSITE_CORNERS;

const ARC_MIDPOINT = 1 - Math.SQRT1_2; // where the arc crosses the diagonal, as a share of half
const ARC_HANDLE = Math.SQRT2 - 1; // tan(22.5deg): quadratic handles that trace an eighth circle

// A link is two quadratic curves meeting on the diagonal, from the top or bottom midpoint to
// the left or right one. Pinch 0 traces the quarter arc. Pinch 1 pulls the meeting point to
// the tile center and straightens both halves, so both orientations become the same plus.
// Continues the current subpath, which must already sit on the top or bottom midpoint.
export const addLink = (path: Path2D, tile: PlacedTile, [signX, signY]: Corner, pinch: number) => {
  const { x, y } = tile;
  const half = tile.size / 2;
  const meet = ARC_MIDPOINT * half * (1 - pinch);
  const handle = half - (ARC_HANDLE + (1 - ARC_HANDLE) * pinch) * half;
  path.quadraticCurveTo(x, y + signY * handle, x + signX * meet, y + signY * meet);
  path.quadraticCurveTo(x + signX * handle, y, x + signX * half, y);
};

// A flip pinches the old orientation in, swaps at the plus, and opens the new one out.
export const linkState = (tile: PlacedTile) =>
  tile.progress < 0.5
    ? { orientation: 1 - tile.orientation, pinch: tile.progress * 2 }
    : { orientation: tile.orientation, pinch: (1 - tile.progress) * 2 };
