type GithubEnvelope<T> = {
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  }
  data: T
}

const commitGraphql = `
  authors(first: 10) {
    author: nodes {
      email
      name
    }
  }
  repository {
    name
  }
  additions
  deletions
  changedFilesIfAvailable
  message
  messageHeadline
  commitUrl
  authoredDate
`;

const commitsByPullRequestLabelGraphql = `
  query getCommitsByPullRequestLabel($query: String!) {
    search(query: $query, type: ISSUE, first: 100) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        ... on PullRequest {
          mergeCommit { ${commitGraphql} }
        }
      }
    }
  }
`;

const reposGraphql = `
  query getRepos($query: String!, $after: String) {
    search(type: REPOSITORY, query: $query, after: $after, first: 100) {
      pageInfo {
        endCursor
        hasNextPage
      }
      repos: nodes {
        ... on Repository {
          name
        }
      }
    }
  }
`;

const commitsGraphql = `
  query getCommits($repo: String!, $since: GitTimestamp!, $until: GitTimestamp!, $after: String) {
    repository(owner: "perrystreetsoftware", name: $repo) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(since: $since, until: $until, after: $after, first: 100) {
              pageInfo {
                endCursor
                hasNextPage
              }
              commits: nodes { ${commitGraphql} }
            }
          }
        }
      }
    }
  }
`;

export async function getCommitsByPullRequestLabel(githubUsername:string, githubPAT: string, repo: string, label: string, dateRange: string): Promise<GithubCommit[]> {
  const path = ["data", "search"];
  const query = `repo:perrystreetsoftware/${repo} label:"${label}" merged:${dateRange} is:pr is:merged sort:updated-desc`;
  const pullRequest = await fetchPaginatedGithub<GithubPullRequest>(githubUsername, githubPAT, commitsByPullRequestLabelGraphql, { query }, path);
  return pullRequest.map(({ mergeCommit }) => mergeCommit);
}

export async function getCommits(githubUsername:string, githubPAT: string, repo: string, startDate: Date, endDate: Date): Promise<GithubCommit[]> {
  const path = ["data", "repository", "defaultBranchRef", "target", "history"];
  const variables = { repo, since: startDate.toISOString(), until: endDate.toISOString() };
  return fetchPaginatedGithub<GithubCommit>(githubUsername, githubPAT, commitsGraphql, variables, path);
}


export async function getRepos(githubUsername:string, githubPAT: string, since: Date): Promise<GithubRepo[]>{
  const path = ["data", "search"];
  const query = `org:perrystreetsoftware sort:updated-desc pushed:>=${since.toISOString()}`;
  return fetchPaginatedGithub<GithubRepo>(githubUsername, githubPAT, reposGraphql, { query }, path);
}

function encodeBase64(string: string): string {
  const byteArray = Uint8Array.from(Array.from(string).map(letter => letter.charCodeAt(0)));
  return figma.base64Encode(byteArray);
}

function get<T>(object: any, path: string[]): GithubEnvelope<T> {
  let index = 0,
    length = path.length;

  while (object != null && index < length) {
    object = object[path[index++]];
  }

  const { pageInfo, ...nodes } = object;
  return { pageInfo, data: nodes[Object.keys(nodes)[0]] };
}

async function fetchPaginatedGithub<T>(githubUsername: string, githubPAT: string, query: string, variables: {}, path: string[]): Promise<T[]> {
  let {pageInfo, data} = await fetchGitHub<T>(githubUsername, githubPAT, query, variables, path);
  while (pageInfo?.hasNextPage) {
    const {pageInfo: nextPageInfo, data: nextData} = await fetchGitHub<T>(githubUsername, githubPAT, query, { ...variables, after: pageInfo.endCursor }, path);
    data = data.concat(nextData);
    pageInfo = nextPageInfo;
  }
  return data;
}

async function fetchGitHub<T>(githubUsername: string, githubPAT: string, query: string, variables: {}, path: string[]): Promise<GithubEnvelope<T[]>> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${encodeBase64(`${githubUsername}:${githubPAT}`)}`,
    },
    body: JSON.stringify({query, variables}),
  });
  return get<T[]>(await response.json(), path);
}
