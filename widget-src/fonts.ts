export const fontInterMedium = { family: "Inter", style: "Medium" };
export const fontInterBold = { family: "Inter", style: "Bold" };
export const fontInterItalic = { family: "Inter", style: "Italic" };

export const fontsAll = [
  fontInterMedium,
  fontInterBold,
  fontInterItalic,
];

export async function loadAllFonts() {
  return Promise.all(fontsAll.map(figma.loadFontAsync));
}

export async function findFonts(fontFamily: string = "Inter"): Promise<Font[]> {
  const fonts = await figma.listAvailableFontsAsync();
  return fonts.filter(({ fontName: { family }}) => family === fontFamily);
}
