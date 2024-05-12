
import * as pivotalCommands from "./pivotal/commands";
import * as githubCommands from "./github/commands";
import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";
import outception from "./outception";
import ResultBuilder from "./resultBuilder";

const getData: Record<string, (parameters: ParameterValues) => Promise<DataByMonthWeek>> = {
  async byEpic({pivotalToken, pivotalProject, pivotalEpic, githubUsername, githubPAT}: ParameterValues): Promise<DataByMonthWeek> {
    const { stories, otherStories, dateRange } = await pivotalCommands.byEpic(pivotalToken, pivotalEpic);
    const commits = await githubCommands.byEpic(githubUsername, githubPAT, pivotalProject, dateRange!);
    return new ResultBuilder()
      .add<PivotalStory>(stories, "stories")
      .add<PivotalStory>(otherStories, "otherStories")
      .add<GithubCommit>(commits, "commits")
      .build();
  },

  async byDate({pivotalToken, pivotalProject, githubUsername, githubPAT, startDate, endDate}: ParameterValues): Promise<DataByMonthWeek> {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const [storiesByDate, commitsByDate] = await Promise.all([
      pivotalCommands.byDate(pivotalToken, pivotalProject, startDate, endDate),
      githubCommands.byDate(githubUsername, githubPAT, pivotalProject, startDate, endDate)
    ]);
    return new ResultBuilder()
      .add<PivotalStory>(storiesByDate, "stories")
      .add<GithubCommit>(commitsByDate, "commits")
      .build();
  },

  async byOwner({pivotalToken, githubUsername, githubPAT, owner, period: { startDate, endDate }}: ParameterValues): Promise<DataByMonthWeek> {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const [storiesByOwner, commitsByOwner] = await Promise.all([
      pivotalCommands.byOwner(pivotalToken, owner, startDate, endDate),
      githubCommands.byOwner(githubUsername, githubPAT, owner, startDate, endDate)
    ]);
    return new ResultBuilder()
      .add<PivotalStory>(storiesByOwner, "stories")
      .add<GithubCommit>(commitsByOwner, "commits")
      .build();
  }
}

figma.parameters.on("input", async (input: ParameterInputEvent) => {
  if (suggestions[input.key]) suggestions[input.key](input);
});

figma.on("run", async ({ command, parameters }: RunEvent) => {
  await loadAllFonts();

  outception(await getData[command](parameters!), command, parameters!);

  figma.closePlugin();
});
