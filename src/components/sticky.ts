type TextComponent = FunctionalWidget<TextProps>;
type StickyChildCallback = (sticky: StickyNode, stickyFormatting: FigmaTextFormat[]) => void

type TextProps = {
  children: FigmaDeclarativeChildren<TextComponent>,
  format?: FigmaTextFormat["format"],
  newLine?: boolean
}

type StickyProps = {
  children: FigmaDeclarativeChildren<TextComponent>,
  fill: string,
  narrow?: boolean
}


const isStickyChildCallback = (child: any): child is StickyChildCallback => typeof child === "function";

export function Br(): StickyChildCallback {
  return (sticky: StickyNode) => sticky.text.characters += "\n";
}

export function Text({ children, format, newLine = false }: TextProps): StickyChildCallback {
  return (sticky: StickyNode, stickyFormatting: FigmaTextFormat[]) => {
    const start = sticky.text.characters.length;

    if (Array.isArray(children)) {
      for (const child of children.flat()) {
        if (typeof child === "string") {
          sticky.text.characters += child;
        } else if (isStickyChildCallback(child)) {
          child(sticky, stickyFormatting);
        }
      }
    }

    const end = sticky.text.characters.length;
    if (newLine) sticky.text.characters += "\n";
    if (format) stickyFormatting.push({ start, end, format });
  };
}

export function Sticky({children, fill, narrow = false}: StickyProps): StickyNode {
  const sticky = figma.createSticky();
  const stickyFormatting: FigmaTextFormat[] = [];

  if (Array.isArray(children)) {
    for (const child of children.flat()) {
      isStickyChildCallback(child) && child(sticky, stickyFormatting);
    }
  }

  stickyFormatting.forEach(({ start, end, format }) => {
    if (format.url) sticky.text.setRangeHyperlink(start, end, {type: "URL", value: format.url});
    if (format.fontName) sticky.text.setRangeFontName(start, end, format.fontName);
    if (format.fill) sticky.text.setRangeFills(start, end, [figma.util.solidPaint(format.fill)]);
    if (format.fontSize) sticky.text.setRangeFontSize(start, end, format.fontSize);
    if (format.listType) sticky.text.setRangeListOptions(start, end, { type: format.listType });
    if (format.lineHeight) sticky.text.setRangeLineHeight(start, end, {unit: "PIXELS", value: format.lineHeight});
  });

  sticky.authorVisible = false;
  sticky.fills = [figma.util.solidPaint(fill)];
  sticky.isWideWidth = !narrow;

  return sticky;
}
