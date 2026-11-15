// Signs of a tile corner relative to the tile center, for example [-1, -1] is top left.
export type Corner = readonly [number, number];

// One tile as a style draws it, already placed on screen.
export type PlacedTile = {
  x: number; // center
  y: number;
  size: number;
  column: number; // grid position, stable while the grid drifts
  row: number;
  orientation: number; // current orientation, the one a flip is heading to
  direction: 1 | -1; // which way the last flip turned
  progress: number; // eased flip progress, 1 when resting
};

// A tile style adds every tile to one shared path, then paints that path in one call,
// so nothing is clipped and neighbors join without seams, even mid-flip.
export type TileStyle = {
  orientations: number;
  addTile: (path: Path2D, tile: PlacedTile) => void;
  paint: (context: CanvasRenderingContext2D, path: Path2D, size: number) => void;
};

export const fillWhite = (context: CanvasRenderingContext2D, path: Path2D) => {
  context.fillStyle = "#fff";
  context.fill(path);
};

export const strokeWhite = (
  context: CanvasRenderingContext2D,
  path: Path2D,
  width: number,
  cap: CanvasLineCap,
) => {
  context.strokeStyle = "#fff";
  context.lineWidth = width;
  context.lineJoin = "round";
  context.lineCap = cap;
  context.stroke(path);
};

// Pairs of opposite corners, top corner first: index 0 is top left with bottom right,
// index 1 is top right with bottom left.
export const OPPOSITE_CORNERS: readonly (readonly [Corner, Corner])[] = [
  [
    [-1, -1],
    [1, 1],
  ],
  [
    [1, -1],
    [-1, 1],
  ],
];

// Tile corners clockwise from the top left. Index i is also the corner whose inside angles
// start at i quarter turns.
export const CLOCKWISE_CORNERS: readonly Corner[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

export const wrap = (index: number, count: number) => ((index % count) + count) % count;

// For styles whose shapes cannot morph into each other: the old shape shrinks away during
// the first half of a flip and the new one grows in during the second.
export const shrinkThenGrow = (tile: PlacedTile, orientations: number) =>
  tile.progress < 0.5
    ? { orientation: wrap(tile.orientation - tile.direction, orientations), scale: 1 - tile.progress * 2 }
    : { orientation: tile.orientation, scale: tile.progress * 2 - 1 };
