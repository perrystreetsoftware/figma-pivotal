import { groupPivotalByMonthAndWeek, pivotalCommands } from "./pivotal/commands";
import { groupGithubByMonthAndWeek, githubCommands } from "./github/commands";
import { fetchEpics } from "./pivotal/fetch";
import pivotalSticky from "./pivotal/sticky";
import githubSticky from "./github/sticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { users, teams } from "./config";

figma.parameters.on("input", async ({ parameters, key, query, result }: ParameterInputEvent) => {
  if (key === "owner") {
    const owners = Object.keys(users);
    result.setSuggestions(owners.filter(s => s.includes(query)));
  } else if (key === "pivotalProject") {
    const setSuggestions = Object.keys(teams);
    result.setSuggestions(setSuggestions.filter(name => name.includes(query)));
  } else if (key === "pivotalEpicId") {
    const epics = await fetchEpics(parameters.pivotalToken, teams[parameters.pivotalProject].pivotal_project_id);
    const epicSuggestions = epics.map(({name, id}) => ({name, data: id}));
    result.setSuggestions(epicSuggestions.filter(({name}) => name.includes(query)));
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
