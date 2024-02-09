import { fetchStoriesByEpic } from "./pivotal";
import { createSticky } from "./sticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { groupBy, getWeek } from "./sort";
import { loadAllFonts } from "./fonts";

figma.on("run", async ({ parameters }: RunEvent) => {
  const stories = await fetchStoriesByEpic(
    parameters!.pivotalToken,
    parseInt(parameters!.pivotalEpicId.replace(/\D/g, ""), 10)
  );

  const storiesByAcceptedAtWeek = groupBy<PivotalStory>(stories, ({ accepted_at }) => {
    if (!accepted_at) return "Not Accepted";

    const acceptedAt = new Date(accepted_at);
    return `${acceptedAt.getFullYear()}-${getWeek(acceptedAt)}`;
  });

  await loadAllFonts();

  const parentFrame = createFrame("HORIZONTAL");

  storiesByAcceptedAtWeek.forEach((stories, week) => {
    const weekFrame = createFrame("VERTICAL");
    weekFrame.name = week;
    stories.forEach(story => weekFrame.appendChild(createSticky(story)));
    parentFrame.appendChild(weekFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
