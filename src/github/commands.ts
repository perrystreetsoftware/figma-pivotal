import format from "date-fns/format";

// import { fetchStoriesByEpic, fetchStoriesByPeriod } from "./github";
// import { users, teams } from "../users";

export function groupGithubByMonthAndWeek(result: ByMonthWeek, prs: GithubPr[])  {
  for (const pr of prs) {
    const mergedAt = new Date(pr.merged_at);
    const month = format(mergedAt, "MMM yyyy");
    const week = `W${format(mergedAt, "w")}`;
    result[month] ||= {};
    result[month][week] ||= {stories: [], prs: []};
    result[month][week].prs.push(pr);
  }
}

export const githubCommands: {[key: string]: (parameters: ParameterValues) => Promise<GithubPr[]>} = {
  async byEpic(parameters: ParameterValues): Promise<GithubPr[]> {
    return [];
  },
  async byDate(parameters: ParameterValues): Promise<GithubPr[]> {
    return [];
  },
  async byOwner(parameters: ParameterValues): Promise<GithubPr[]> {
    return [];
  }
};