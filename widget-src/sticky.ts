export default class Sticky {
  sticky: StickyNode;
  stickyFormatting: Format[];

  constructor() {
    this.sticky = figma.createSticky();
    this.stickyFormatting = [];
  }

  text(string: string) {
    this.sticky.text.characters += string;
  }

  textWithFormatting(callbackOrString: Function | string, format: Format["format"]) {
    const start = this.sticky.text.characters.length;
    typeof callbackOrString == "function" ? callbackOrString() : this.sticky.text.characters += callbackOrString;
    const end = this.sticky.text.characters.length;
    this.stickyFormatting.push({start, end, format});
  }

  applyFormatting() {
    this.stickyFormatting.forEach(({start, end, format}) => {
      if (format.url) this.sticky.text.setRangeHyperlink(start, end, {type: "URL", value: format.url});
      if (format.fontName) this.sticky.text.setRangeFontName(start, end, format.fontName);
      if (format.fill) this.sticky.text.setRangeFills(start, end, [format.fill]);
      if (format.fontSize) this.sticky.text.setRangeFontSize(start, end, format.fontSize);
      if (format.listType) this.sticky.text.setRangeListOptions(start, end, { type: format.listType });
      if (format.lineHeight) this.sticky.text.setRangeLineHeight(start, end, { unit: "PIXELS", value: format.lineHeight });
    });
    // this.sticky.text.getStyledTextSegments(["fontName", "hyperlink"]).forEach(console.log);
  }

  fills(fills: SolidPaint) {
    this.sticky.fills = [fills];
  }

  setPluginData(key: string, value: string) {
    this.sticky.setPluginData(key, value);
  }

  authorVisible(visible: boolean) {
    this.sticky.authorVisible = visible;
  }

  getNode() {
    return this.sticky;
  }
}
