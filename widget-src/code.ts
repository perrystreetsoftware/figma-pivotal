import { groupBy } from "ramda";
import { getWeek } from "date-fns";

import { fetchStoriesByEpic } from "./pivotal";
import pivotalSticky from "./pivotalSticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";

const byWeek = groupBy(({ accepted_at }: PivotalStory): string => {
  if (!accepted_at) return "Not Accepted";

  const acceptedAt = new Date(accepted_at);
  const acceptedAtFormat = Intl.DateTimeFormat("en-US", {month: "short", year: "numeric" }).format(acceptedAt);
  return `W${getWeek(acceptedAt)} ${acceptedAtFormat}`;
});

figma.on("run", async ({ parameters }: RunEvent) => {
  const stories = await fetchStoriesByEpic(
    parameters!.pivotalToken,
    parseInt(parameters!.pivotalEpicId.replace(/\D/g, ""), 10)
  );

  const storiesByAcceptedAtWeek: {[key: string]: PivotalStory[]} = byWeek(stories);

  await loadAllFonts();

  const parentFrame = createFrame("HORIZONTAL");

  Object.entries(storiesByAcceptedAtWeek).forEach(([week, stories]) => {
    const weekFrame = createFrame("VERTICAL");
    weekFrame.name = week;
    stories.forEach(story => weekFrame.appendChild(pivotalSticky(story)));
    parentFrame.appendChild(weekFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
