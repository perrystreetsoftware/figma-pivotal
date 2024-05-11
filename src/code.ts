
import * as pivotalCommands from "./pivotal/commands";
import * as githubCommands from "./github/commands";
import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";
import outception from "./outception";
import ResultBuilder from "./resultBuilder";

async function getData(command: string, parameters: ParameterValues): Promise<DataByMonthWeek> {
  let resultBuilder = new ResultBuilder();
  switch (command) {
    case 'byEpic':
      const { stories, otherStories, dateRange } = await pivotalCommands.byEpic(parameters.pivotalToken, parameters.pivotalEpicId);
      const commits = await githubCommands.byEpic(parameters.githubUsername, parameters.githubPAT, parameters.pivotalProject, dateRange!);
      return resultBuilder
        .add<PivotalStory>(stories, "stories")
        .add<PivotalStory>(otherStories, "otherStories")
        .add<GithubCommit>(commits, "commits")
        .build();

    case 'byDate':
      return resultBuilder
        .add<PivotalStory>(await pivotalCommands.byDate(parameters), "stories")
        .build();

    case 'byOwner':
      const [storiesByOwner, commitsByOwner] = await Promise.all([pivotalCommands.byOwner(parameters), githubCommands.byOwner(parameters)]);
      return resultBuilder
        .add<PivotalStory>(storiesByOwner, "stories")
        .add<GithubCommit>(commitsByOwner, "commits")
        .build();

    default:
      throw new Error(`Unknown command ${command}.`);
  }
}

figma.parameters.on("input", async (input: ParameterInputEvent) => {
  if (suggestions[input.key]) suggestions[input.key](input);
});

figma.on("run", async ({ command, parameters }: RunEvent) => {
  await loadAllFonts();

  outception(await getData(command, parameters!), command, parameters!);

  figma.closePlugin();
});
