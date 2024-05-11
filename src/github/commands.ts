import { getRepos, getCommits } from "./fetch";
import { users } from "../config/config";

export async function byOwner(parameters: ParameterValues): Promise<GithubCommit[]> {
  const { github_emails: githubEmails } = users[parameters!.owner];

  const repos = await getRepos(parameters!.githubUsername, parameters!.githubPAT, new Date(parameters!.period.startDate));
  const commits = await Promise.all(repos.map(async ({name}) =>
    getCommits(parameters!.githubUsername, parameters!.githubPAT, name, new Date(parameters!.period.startDate), new Date(parameters!.period.endDate))
  ));

  return commits.flat().filter(({authors}) => authors.author.some(({email}) => githubEmails!.includes(email)));
}
