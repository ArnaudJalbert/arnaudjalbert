// Cuts text out of an overlay: draws the text's glyphs, word by word where the page laid them
// out, as holes in an otherwise opaque mask for `host`. Redrawn once the font has loaded
// and whenever the window resizes, since both move the glyphs.
export const maskOutText = (host: HTMLElement, text: Element) => {
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

    const style = getComputedStyle(text);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
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

  document.fonts.ready.then(draw);
  addEventListener("resize", draw);
};
