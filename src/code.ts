import { groupPivotalByMonthAndWeek, pivotalCommands } from "./pivotal/commands";
import { groupGithubByMonthAndWeek, githubCommands } from "./github/commands";
import pivotalSticky from "./pivotal/sticky";
import githubSticky from "./github/sticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";

figma.parameters.on("input", async (input: ParameterInputEvent) => {
  if (suggestions[input.key]) {
    suggestions[input.key](input);
  }
});

figma.on("run", async ({ command, parameters }: RunEvent) => {
  const [pivotalStories, githubPrs] = await Promise.all([
    pivotalCommands[command](parameters!),
    githubCommands[command](parameters!)
  ]);
  const storiesAndPrsByDate: ByMonthWeek = {};
  groupPivotalByMonthAndWeek(storiesAndPrsByDate, pivotalStories);
  groupGithubByMonthAndWeek(storiesAndPrsByDate, githubPrs);

  await loadAllFonts();

  const parentFrame = createFrame("HORIZONTAL", 5);
  parentFrame.name = "Outception";

  Object.entries(storiesAndPrsByDate).forEach(([month, weeks]) => {
    const monthFrame = createFrame("HORIZONTAL", 3);
    monthFrame.name = month;

    Object.entries(weeks).forEach(([week, {stories, prs}]) => {
      const weekFrame = createFrame("VERTICAL", 1);
      weekFrame.name = week;
      stories.forEach(story => weekFrame.appendChild(pivotalSticky(story)));
      prs.forEach(pr => weekFrame.appendChild(githubSticky(pr)));
      monthFrame.appendChild(weekFrame);
    });

    parentFrame.appendChild(monthFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
