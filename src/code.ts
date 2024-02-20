import { groupPivotalByMonthAndWeek, pivotalCommands } from "./pivotal/commands";
import { groupGithubByMonthAndWeek, githubCommands } from "./github/commands";
import { fetchEpics } from "./pivotal/fetch";
import pivotalSticky from "./pivotal/sticky";
import githubSticky from "./github/sticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { users, teams, periods } from "./config";

type Suggestion<T> = {
  name: string,
  data: T
};

figma.parameters.on("input", async ({ parameters, key, query, result }: ParameterInputEvent) => {
  if (key === "owner") {
    const owners = Object.keys(users);
    result.setSuggestions(owners.filter(s => s.includes(query)));
  } else if (key === "pivotalProject") {
    const setSuggestions = Object.keys(teams);
    result.setSuggestions(setSuggestions.filter(name => name.includes(query)));
  } else if (key === "pivotalEpicId") {
    const epics = await fetchEpics(parameters.pivotalToken, teams[parameters.pivotalProject].pivotal_project_id);
    const epicSuggestions: Suggestion<number>[] = epics.map(({name, id}) => ({name, data: id}));
    result.setSuggestions(epicSuggestions.filter(({name}) => name.includes(query)));
  } else if (key === "period") {
    const periodsSuggestions = Object.keys(periods).reduce((acc, name) => {
      const {t1, t2, t3, ...year} = periods[name];
      acc.push({name, data: year})
      acc.push({name: `${name} T1`, data: t1});
      acc.push({name: `${name} T2`, data: t2});
      acc.push({name: `${name} T3`, data: t3});
      return acc;
    }, [] as Suggestion<{startDate: string, endDate: string}>[]);
    result.setSuggestions(periodsSuggestions.filter(({name}) => name.includes(query)));
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
