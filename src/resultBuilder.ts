import { lightFormat } from "date-fns/lightFormat";
import { getWeek } from "date-fns/getWeek";

type ResultType<T> = T extends GithubCommit ? "commits" : ("stories" | "otherStories");


export default class ResultBuilder {
  private result: DataByMonthWeek = {};

  add<T extends PivotalStory | GithubCommit>(data: T[], resultType: ResultType<T>): ResultBuilder {
    this.groupByMonthWeek<T>(data, resultType);
    return this;
  }

  build(): DataByMonthWeek {
    return this.result;
  }

  private groupByMonthWeek<T extends PivotalStory | GithubCommit>(data: T[], resultType: ResultType<T>) {
    for (const item of data) {
      let month: string, week: string;

      const dateString = this.isGithubCommit(item) ? item.authoredDate : item.accepted_at;
      if (dateString) {
        const date = new Date(dateString);
        month = lightFormat(date, "yyyy/MM");
        week = `W${getWeek(date)}`;
      } else {
        month = "Not Accepted";
        week = "n/a"
      }

      this.result[month] ||= {};
      this.result[month][week] ||= { stories: [], commits: [], otherStories: [] };
      (this.result[month][week][resultType] as T[]).push(item);
    }
  }

  private isGithubCommit(data: PivotalStory | GithubCommit): data is GithubCommit {
    return (data as GithubCommit).authoredDate !== undefined;
  }
}