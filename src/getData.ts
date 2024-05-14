import * as pivotalCommands from "./pivotal/commands";
import * as githubCommands from "./github/commands";
import { dateFormat, getWeek, isValidDate } from "./date";

type ResultType<T> = T extends GithubCommit ? "commits" : ("stories" | "otherStories");

const isGithubCommit = (item: PivotalStory | GithubCommit): item is GithubCommit => item.hasOwnProperty('authoredDate');

class ResultBuilder {
  private result: DataByMonthWeek = {};

  add<T extends PivotalStory | GithubCommit>(data: T[], resultType?: ResultType<T>): ResultBuilder {
    for (const item of data) {
      if (resultType === undefined) resultType = (isGithubCommit(item) ? "commits" : "stories") as ResultType<T>;
      const date = new Date(isGithubCommit(item) ? item.authoredDate : item.accepted_at);
      const [month, week] = isValidDate(date) ? [dateFormat(date, false), `W${getWeek(date)}`] : ["n/a", "n/a"];

      this.result[month] ||= {};
      this.result[month][week] ||= { stories: [], commits: [], otherStories: [] };
      (this.result[month][week][resultType] as T[]).push(item);
    }
    return this;
  }

  build(): DataByMonthWeek {
    return this.result;
  }
}

export const getData: Record<string, (parameters: ParameterValues) => Promise<DataByMonthWeek>> = {
  async byEpic({pivotalToken, pivotalProject, pivotalEpic, githubUsername, githubPAT}: ParameterValues): Promise<DataByMonthWeek> {
    const { stories, otherStories, dateRange } = await pivotalCommands.byEpic(pivotalToken, pivotalEpic);
    const commits = await githubCommands.byEpic(githubUsername, githubPAT, pivotalProject, dateRange!);

    return new ResultBuilder().add(stories).add(otherStories, "otherStories").add(commits).build();
  },

  async byDate({pivotalToken, pivotalProject, githubUsername, githubPAT, startDate, endDate}: ParameterValues): Promise<DataByMonthWeek> {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const [storiesByDate, commitsByDate] = await Promise.all([
      pivotalCommands.byDate(pivotalToken, pivotalProject, startDate, endDate),
      githubCommands.byDate(githubUsername, githubPAT, pivotalProject, startDate, endDate)
    ]);

    return new ResultBuilder().add(storiesByDate).add(commitsByDate).build();
  },

  async byOwner({pivotalToken, githubUsername, githubPAT, owner, period: { startDate, endDate }}: ParameterValues): Promise<DataByMonthWeek> {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const [storiesByOwner, commitsByOwner] = await Promise.all([
      pivotalCommands.byOwner(pivotalToken, owner, startDate, endDate),
      githubCommands.byOwner(githubUsername, githubPAT, owner, startDate, endDate)
    ]);

    return new ResultBuilder().add(storiesByOwner).add(commitsByOwner).build();
  }
}
