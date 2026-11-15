const GRAIN_TILE = 256;
const GRAIN_ALPHA = 0.14;

// Gray noise clustered around the middle, so most grains are subtle and a few stand out.
const grainValue = () => ((Math.random() + Math.random() + Math.random()) / 3) * 255;

// Film grain, generated once and repeated by CSS as the element's background. Gray grains
// lighten black and darken white. CSS scales the tile up so grains are soft clumps rather
// than single pixels, and jumps the layer around to make it crawl. Moving a layer costs
// the GPU nothing to repaint, unlike painting grain into every canvas frame.
export const paintGrain = (element: HTMLElement) => {
  const tile = document.createElement("canvas");
  tile.width = tile.height = GRAIN_TILE;
  const context = tile.getContext("2d")!;
  const pixels = context.createImageData(GRAIN_TILE, GRAIN_TILE);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = grainValue();
    pixels.data.set([value, value, value, GRAIN_ALPHA * 255], i);
  }
  context.putImageData(pixels, 0, 0);
  element.style.backgroundImage = `url(${tile.toDataURL()})`;
};
