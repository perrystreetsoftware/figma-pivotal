declare type FigmaTextFormat = {
  start: number;
  end: number;
  format: {
    fontName?: FontName;
    fill?: string;
    fontSize?: number;
    url?: string;
    listType?: "ORDERED" | "UNORDERED";
    lineHeight?: number;
  }
}
