import { addLink, LINKED_CORNERS, linkState } from "./links";
import { strokeWhite, type TileStyle } from "./tile-style";

// Thick white links on black, joining into endless winding lines.
export const lines: TileStyle = {
  orientations: 2,
  addTile: (path, tile) => {
    const { orientation, pinch } = linkState(tile);
    for (const corner of LINKED_CORNERS[orientation]) {
      path.moveTo(tile.x, tile.y + corner[1] * (tile.size / 2));
      addLink(path, tile, corner, pinch);
    }
  },
  // Butt ends meet flush at tile edges, so the line runs on without a seam.
  paint: (context, path, size) => strokeWhite(context, path, size / 3, "butt"),
};
