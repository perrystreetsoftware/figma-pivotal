import format from "date-fns/format";

import pivotalCommands from "./pivotal/commands";
import githubCommands from "./github/commands";
import { loadAllFonts } from "./fonts";
import { suggestions } from "./suggestions";
import outception from "./outception";

figma.parameters.on("input", async (input: ParameterInputEvent) => {
  if (suggestions[input.key]) {
    suggestions[input.key](input);
  }
});

function isGithubCommit(item: any): item is GithubCommit {
  return (item as GithubCommit).authoredDate !== undefined;
}

export function groupBy<T extends PivotalStory | GithubCommit>(result: ByMonthWeek, data: T[])  {
  for (const item of data) {
    let month: string, week: string;

    const dateString = isGithubCommit(item) ? item.authoredDate : item.accepted_at;
    if (dateString) {
      const date = new Date(dateString);
      month = format(date, "yyyy/MM");
      week = `W${format(date, "ww")}`;
    } else {
      month = "Not Accepted";
      week = "n/a"
    }

    result[month] ||= {};
    result[month][week] ||= {stories: [], commits: []};
    isGithubCommit(item) ? result[month][week].commits.push(item) : result[month][week].stories.push(item);
  }
}

figma.on("run", async ({ command, parameters }: RunEvent) => {
  const [pivotalStories, githubCommits] = await Promise.all([
    pivotalCommands[command](parameters!),
    githubCommands[command](parameters!)
  ]);
  const storiesAndCommits: ByMonthWeek = {};
  groupBy<PivotalStory>(storiesAndCommits, pivotalStories);
  groupBy<GithubCommit>(storiesAndCommits, githubCommits);

  await loadAllFonts();

  outception(storiesAndCommits, command, parameters!);

  figma.closePlugin();
});
