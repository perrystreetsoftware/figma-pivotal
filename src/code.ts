import format from "date-fns/format";

import pivotalCommands from "./pivotal/commands";
import githubCommands from "./github/commands";
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

function dateFormat(date: string): string {
  return format(new Date(date), "yyyy/MM/dd");
}

const title: {[command: string]: (parameters: ParameterValues) => string} = {
  byEpic: ({pivotalEpicId, pivotalProject}: ParameterValues) => `Outception for Epic "${pivotalEpicId} in Project ${pivotalProject}"`,
  byDate: ({pivotalProject, startDate, endDate}: ParameterValues) => `Outception for Project "${pivotalProject}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}`,
  byOwner: ({owner, period: {startDate, endDate}}: ParameterValues) => `Outception for "${owner}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}"`
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

  const parentFrame = createFrame("HORIZONTAL", 5, title[command](parameters!));

  Object.keys(storiesAndCommits).sort().forEach(month => {
    const monthFrame = createFrame("HORIZONTAL", 3, month);

    Object.keys(storiesAndCommits[month]).sort().forEach((week) => {
      const {stories, commits} = storiesAndCommits[month][week];
      const weekFrame = createFrame("HORIZONTAL", 2, week);

      if (stories.length > 0) {
        const weekStoriesFrame = createFrame("VERTICAL", 1, "Stories");
        weekFrame.appendChild(weekStoriesFrame);
        stories.forEach(story => weekStoriesFrame.appendChild(pivotalSticky(story)));
      }

      if (commits.length > 0) {
        const weekCommitsFrame = createFrame("VERTICAL", 1, "Commits");
        weekFrame.appendChild(weekCommitsFrame);
        commits.forEach(commit => weekCommitsFrame.appendChild(githubSticky(commit)));
      }

      monthFrame.appendChild(weekFrame);
    });

    parentFrame.appendChild(monthFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
