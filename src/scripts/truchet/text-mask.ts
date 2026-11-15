// Cuts text out of an overlay: draws the text's glyphs, word by word where the page laid them
// out, as holes in an otherwise opaque mask for `host`. Redrawn whenever a font finishes
// loading and whenever the window resizes, since both move the glyphs.
export const maskOutText = (host: HTMLElement, text: Element) => {
  const font = () => {
    const style = getComputedStyle(text);
    return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  };

  const draw = () => {
    const hostBox = host.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio, 2);
    const mask = document.createElement("canvas");
    mask.width = hostBox.width * ratio;
    mask.height = hostBox.height * ratio;
    const context = mask.getContext("2d")!;
    context.scale(ratio, ratio);
    context.fillRect(0, 0, hostBox.width, hostBox.height);
    context.globalCompositeOperation = "destination-out";

    context.font = font();
    context.textBaseline = "alphabetic";
    // A thin outline widens the holes past the glyphs' soft edges.
    context.lineWidth = 2;
    const ascent = context.measureText("A").fontBoundingBoxAscent;

    const range = document.createRange();
    const node = text.firstChild!;
    for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const word = range.getBoundingClientRect();
      const x = word.left - hostBox.left;
      const y = word.top - hostBox.top + ascent;
      context.fillText(match[0], x, y);
      context.strokeText(match[0], x, y);
    }
    host.style.maskImage = `url(${mask.toDataURL()})`;
  };

  // `document.fonts.ready` can resolve before the web font is even requested, which drew
  // the holes in the fallback font. Load the text's own font first, and redraw if any
  // font lands later and reflows the text.
  document.fonts.load(font()).then(draw, draw);
  document.fonts.addEventListener("loadingdone", draw);
  addEventListener("resize", draw);
};
