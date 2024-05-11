import { getRepos, getCommits, getCommitsByPullRequestLabel } from "./fetch";
import { users, teams } from "../config/config";

export async function byEpic(githubUsername: string, githubPAT: string, pivotalProject: string, dateRange: string): Promise<GithubCommit[]> {
  const { name, repos } = teams[pivotalProject];
  const commits = await Promise.all(repos.map(async (repo) => getCommitsByPullRequestLabel(githubUsername, githubPAT, repo, name.replace(/\s+/, ""), dateRange)))
  return commits.flat();
}

export async function byOwner(parameters: ParameterValues): Promise<GithubCommit[]> {
  const { github_emails: githubEmails } = users[parameters!.owner];

  const repos = await getRepos(parameters!.githubUsername, parameters!.githubPAT, new Date(parameters!.period.startDate));
  const commits = await Promise.all(repos.map(async ({name}) =>
    getCommits(parameters!.githubUsername, parameters!.githubPAT, name, new Date(parameters!.period.startDate), new Date(parameters!.period.endDate))
  ));

  return commits.flat().filter(({authors}) => authors.author.some(({email}) => githubEmails!.includes(email)));
}
