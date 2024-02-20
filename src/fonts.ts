export const fonts = {
  interMedium: { family: "Inter", style: "Medium" },
  interBold: { family: "Inter", style: "Bold" },
  interItalic: { family: "Inter", style: "Italic" },
};

export async function loadAllFonts() {
  return Promise.all(Object.values(fonts).map(figma.loadFontAsync));
}

export async function findFonts(fontFamily: string = "Inter"): Promise<Font[]> {
  const fonts = await figma.listAvailableFontsAsync();
  return fonts.filter(({ fontName: { family }}) => family === fontFamily);
}
