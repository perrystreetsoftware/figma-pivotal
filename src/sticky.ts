type TextComponent = FunctionalWidget<TextProps>;
type StickyChildCallback = (sticky: StickyNode, stickyFormatting: FigmaTextFormat[]) => void

type TextProps = {
  children: FigmaDeclarativeChildren<TextComponent>,
  format?: FigmaTextFormat["format"],
  newLine?: boolean
}

type StickyProps = {
  children: FigmaDeclarativeChildren<TextComponent>,
  fill: string
}

export function Br() {
  return (sticky: StickyNode) => sticky.text.characters += "\n";
}

function isStickyChildCallback(child: any): child is StickyChildCallback {
  return typeof child === "function";
}

export function Text({ children, format, newLine = false }: TextProps): StickyChildCallback {
  return (sticky: StickyNode, stickyFormatting: FigmaTextFormat[]) => {
    const start = sticky.text.characters.length;

    if (Array.isArray(children)) {
      children.flat().forEach((child) => {
        if (typeof child === "string") {
          sticky.text.characters += child;
        } else if (isStickyChildCallback(child)) {
          child(sticky, stickyFormatting);
        }
      });
    }

    const end = sticky.text.characters.length;
    if (newLine) sticky.text.characters += "\n";
    if (format) stickyFormatting.push({ start, end, format });
  };
}

export function Sticky({children, fill}: StickyProps): StickyNode {
  const sticky = figma.createSticky();
  const stickyFormatting: FigmaTextFormat[] = [];

  if (Array.isArray(children)) {
    children.flat().forEach((child) => {
      if (isStickyChildCallback(child)) {
        child(sticky, stickyFormatting)
      }
    });
  }

  stickyFormatting.forEach(({ start, end, format }) => {
    if (format.url) sticky.text.setRangeHyperlink(start, end, {type: "URL", value: format.url});
    if (format.fontName) sticky.text.setRangeFontName(start, end, format.fontName);
    if (format.fill) sticky.text.setRangeFills(start, end, [figma.util.solidPaint(format.fill)]);
    if (format.fontSize) sticky.text.setRangeFontSize(start, end, format.fontSize);
    if (format.listType) sticky.text.setRangeListOptions(start, end, { type: format.listType });
    if (format.lineHeight) sticky.text.setRangeLineHeight(start, end, {unit: "PIXELS", value: format.lineHeight});
  });

  // sticky.setPluginData(pluginData.key, pluginData.value);
  sticky.authorVisible = false;
  sticky.fills = [figma.util.solidPaint(fill)];

  return sticky;
}