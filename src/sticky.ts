type TextProps = (string | Function)[] | string | Function;

type StickyProps = (Function | boolean)[] | Function | boolean;

export function Br() {
  return (sticky: StickyNode) => sticky.text.characters += "\n";
}

export function Text({ children, format, newLine = false }: { children: TextProps; format?: FigmaTextFormat["format"], newLine?: boolean}) {
  return (sticky: StickyNode, stickyFormatting: FigmaTextFormat[]) => {
    const start = sticky.text.characters.length;
    children.flat().forEach((child) => {
      if (typeof child === "string") {
        sticky.text.characters += child;
      } else if (typeof child === "function") {
        child(sticky, stickyFormatting);
      } else {
        console.log("else child text", child);
      }
    });
    const end = sticky.text.characters.length;
    if (newLine) sticky.text.characters += "\n";
    if (format) stickyFormatting.push({ start, end, format });
  };
}

export function Sticky({children, fill}: {children: StickyProps, fill: string}): StickyNode {
  const sticky = figma.createSticky();
  const stickyFormatting: FigmaTextFormat[] = [];

  children.flat().forEach((child) => {
    if (typeof child === "function") {
      child(sticky, stickyFormatting)
    } else {
      console.log("else child sticky", child);
    }
  });

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