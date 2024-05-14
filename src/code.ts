import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";
import { getData } from "./getData";
import outception from "./outception";

figma.parameters.on("input", async (input: ParameterInputEvent) => {
  if (suggestions[input.key]) suggestions[input.key](input);
});

figma.on("run", async ({ command, parameters }: RunEvent) => {
  await loadAllFonts();

  outception(await getData[command](parameters!), command, parameters!);

  figma.closePlugin();
});
