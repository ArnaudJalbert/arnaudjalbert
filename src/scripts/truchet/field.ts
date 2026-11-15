import { arches } from "./arches";
import { blobs } from "./blobs";
import { diagonals } from "./diagonals";
import { fans } from "./fans";
import { lines } from "./lines";
import { wrap, type PlacedTile, type TileStyle } from "./tile-style";
import { triangles } from "./triangles";

// A grid of Truchet tiles drifting from the top left corner. Every so often a random tile
// flips to another orientation. Each visit starts on a random style, and a click cycles them.
const STYLES: readonly TileStyle[] = [lines, blobs, triangles, diagonals, fans, arches];
const DRIFT_SPEED = 18; // px per second, along the diagonal
const FLIP_INTERVAL = 0.18; // seconds between flips
const FLIP_SECONDS = 1.3;
const FRAME_MS = 1000 / 30;
const MAX_PIXEL_RATIO = 2; // sharper screens cost more pixels without looking different
const TILES_PER_SHORT_SIDE = 9;
const MIN_TILE_SIZE = 48;

type Tile = { orientation: number; flipStart: number; direction: 1 | -1 };

const ease = (t: number) => t * t * (3 - 2 * t);

export const startTruchetField = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d")!;
  let style = STYLES[Math.floor(Math.random() * STYLES.length)];
  let pixelRatio = 1;
  let size = 0;
  let width = 0;
  let height = 0;
  let offset = 0; // how far the grid has drifted, along each axis
  let elapsed = 0;
  let sinceFlip = 0;

  // Tiles live in a square buffer that wraps in both directions. A tile drifting off the
  // bottom right comes back in at the top left, where it reads as just another random tile.
  // The buffer spans the whole device screen, so browser bars showing or hiding never
  // reshuffle it, and only a new tile size or style does.
  let span = 0;
  let tiles: Tile[] = [];

  const randomTiles = () =>
    Array.from({ length: span * span }, (): Tile => ({
      orientation: Math.floor(Math.random() * style.orientations),
      flipStart: -Infinity,
      direction: 1,
    }));

  const tileAt = (column: number, row: number) => tiles[wrap(column, span) + wrap(row, span) * span];

  const resize = () => {
    pixelRatio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    // Whole device pixels, so tile edges never fall between pixels and shimmer.
    const cssSize = Math.max(MIN_TILE_SIZE, Math.min(width, height) / TILES_PER_SHORT_SIDE);
    size = Math.round(cssSize * pixelRatio) / pixelRatio;
    const longest = Math.max(width, height, screen.width, screen.height);
    const neededSpan = Math.ceil(longest / size) + 2;
    if (neededSpan !== span) {
      span = neededSpan;
      tiles = randomTiles();
    }
  };

  const flipProgress = (tile: Tile) => Math.min(1, (elapsed - tile.flipStart) / FLIP_SECONDS);

  // One object handed to the style for every tile, since styles only read it.
  const placed: PlacedTile = { x: 0, y: 0, size: 0, column: 0, row: 0, orientation: 0, direction: 1, progress: 1 };

  const render = () => {
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    const shift = Math.round((offset % size) * pixelRatio) / pixelRatio;
    const first = -Math.floor(offset / size) - 1; // grid index just above and left of the screen
    const columns = Math.ceil(width / size) + 2;
    const rows = Math.ceil(height / size) + 2;
    const path = new Path2D();
    placed.size = size;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const tile = tileAt(first + column, first + row);
        placed.x = (column - 0.5) * size + shift;
        placed.y = (row - 0.5) * size + shift;
        placed.column = first + column;
        placed.row = first + row;
        placed.orientation = tile.orientation;
        placed.direction = tile.direction;
        placed.progress = ease(flipProgress(tile));
        style.addTile(path, placed);
      }
    }
    style.paint(context, path, size);
  };

  const flipRandomTile = () => {
    const first = -Math.floor(offset / size) - 1;
    const column = first + Math.floor(Math.random() * (width / size + 2));
    const row = first + Math.floor(Math.random() * (height / size + 2));
    const tile = tileAt(column, row);
    if (flipProgress(tile) < 1) return;
    tile.direction = Math.random() < 0.5 ? 1 : -1;
    tile.orientation = wrap(tile.orientation + tile.direction, style.orientations);
    tile.flipStart = elapsed;
  };

  const advance = (seconds: number) => {
    elapsed += seconds;
    offset += (DRIFT_SPEED / Math.SQRT2) * seconds;
    sinceFlip += seconds;
    while (sinceFlip > FLIP_INTERVAL) {
      sinceFlip -= FLIP_INTERVAL;
      flipRandomTile();
    }
  };

  const nextStyle = () => {
    style = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length];
    tiles = randomTiles();
    render();
  };

  resize();
  render();
  addEventListener("resize", () => {
    resize();
    render();
  });
  addEventListener("click", (event) => {
    if (!(event.target as Element).closest("a")) nextStyle();
  });

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let last = performance.now();
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (now - last < FRAME_MS) return;
    advance(Math.min((now - last) / 1000, 0.1));
    last = now;
    render();
  };
  requestAnimationFrame(frame);
};
