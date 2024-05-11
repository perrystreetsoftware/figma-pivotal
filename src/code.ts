import { lightFormat } from "date-fns/lightFormat";
import { getWeek } from "date-fns/getWeek";
import * as pivotalCommands from "./pivotal/commands";
import * as githubCommands from "./github/commands";
import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";
import outception from "./outception";

function groupByMonthWeek<T extends PivotalStory | GithubCommit>(result: DataByMonthWeek, data: T[], dateAccessor: keyof T, resultFn: (data: Data, item: T) => void): DataByMonthWeek {
  for (const item of data) {
    let month: string, week: string;

    const dateString = item[dateAccessor] as string;
    if (dateString) {
      const date = new Date(dateString);
      month = lightFormat(date, "yyyy/MM");
      week = `W${getWeek(date)}`;
    } else {
      month = "Not Accepted";
      week = "n/a"
    }

    result[month] ||= {};
    result[month][week] ||= { stories: [], commits: [], otherStories: [] };
    resultFn(result[month][week], item);
  }

  return result;
}

async function getData(command: string, parameters: ParameterValues): Promise<DataByMonthWeek> {
  let result: DataByMonthWeek = {};
  switch (command) {
    case 'byEpic':
      const { stories, otherStories } = await pivotalCommands.byEpic(parameters);
      result = groupByMonthWeek<PivotalStory>(result, stories, 'accepted_at', (data, item) => data.stories.push(item));
      return groupByMonthWeek<PivotalStory>(result, otherStories!, 'accepted_at', (data, item) => data.otherStories.push(item));
    case 'byDate':
      const storiesByDate = await pivotalCommands.byDate(parameters);
      return groupByMonthWeek<PivotalStory>(result, storiesByDate, 'accepted_at', (data, item) => data.stories.push(item));
    case 'byOwner':
      const [storiesByOwner, commitsByOwner] = await Promise.all([pivotalCommands.byOwner(parameters), githubCommands.byOwner(parameters)]);
      result = groupByMonthWeek<PivotalStory>(result, storiesByOwner, 'accepted_at', (data, item) => data.stories.push(item));
      return groupByMonthWeek<GithubCommit>(result, commitsByOwner, 'authoredDate', (data, item) => data.commits.push(item));
    default:
      throw new Error(`Unknown command ${command}`);
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
