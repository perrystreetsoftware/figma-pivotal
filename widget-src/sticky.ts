export default class Sticky {
  sticky: StickyNode;
  stickyFormatting: FigmaTextFormat[];

  constructor() {
    this.sticky = figma.createSticky();
    this.stickyFormatting = [];
  }

  text(string: string) {
    this.sticky.text.characters += string;
  }

  textWithFormatting(callbackOrString: Function | string, format: FigmaTextFormat["format"]) {
    const start = this.sticky.text.characters.length;
    typeof callbackOrString == "function" ? callbackOrString() : this.sticky.text.characters += callbackOrString;
    const end = this.sticky.text.characters.length;
    this.stickyFormatting.push({start, end, format});
  }

  fill(fill: string) {
    this.sticky.fills = [figma.util.solidPaint(fill)];
  }

  setPluginData(key: string, value: string) {
    this.sticky.setPluginData(key, value);
  }

  authorVisible(visible: boolean) {
    this.sticky.authorVisible = visible;
  }

  private applyFormatting() {
    this.stickyFormatting.forEach(({start, end, format}) => {
      if (format.url) this.sticky.text.setRangeHyperlink(start, end, { type: "URL", value: format.url });
      if (format.fontName) this.sticky.text.setRangeFontName(start, end, format.fontName);
      if (format.fill) this.sticky.text.setRangeFills(start, end, [figma.util.solidPaint(format.fill)]);
      if (format.fontSize) this.sticky.text.setRangeFontSize(start, end, format.fontSize);
      if (format.listType) this.sticky.text.setRangeListOptions(start, end, { type: format.listType });
      if (format.lineHeight) this.sticky.text.setRangeLineHeight(start, end, { unit: "PIXELS", value: format.lineHeight });
    });
  }

  getNode() {
    this.applyFormatting();
    return this.sticky;
  }
}
