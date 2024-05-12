import { getRepos, getCommits, getCommitsByPullRequestLabel } from "./fetch";

export async function byEpic(githubUsername: string, githubPAT: string, { name, repos }: PSSTeam, dateRange: string): Promise<GithubCommit[]> {
  const commits = await Promise.all(repos.map(repo => getCommitsByPullRequestLabel(githubUsername, githubPAT, repo, name.replace(/\s+/, ""), dateRange)))
  return commits.flat();
}

export async function byDate(githubUsername: string, githubPAT: string, { name, repos }: PSSTeam, startDate: Date, endDate: Date): Promise<GithubCommit[]> {
  const dateRange = `${startDate.toISOString().split("T")[0]}..${endDate.toISOString().split("T")[0]}`;
  const commits = await Promise.all(repos.map(repo => getCommitsByPullRequestLabel(githubUsername, githubPAT, repo, name.replace(/\s+/, ""), dateRange)));
  return commits.flat();
}

export async function byOwner(githubUsername: string, githubPAT: string, { github_emails }: PSSUser, startDate: Date, endDate: Date): Promise<GithubCommit[]> {
  const repos = await getRepos(githubUsername, githubPAT, startDate);
  const commits = await Promise.all(repos.map(({name}) => getCommits(githubUsername, githubPAT, name, startDate, endDate)));
  return commits.flat().filter(({authors}) => authors.author.some(({email}) => github_emails!.includes(email)));
}
