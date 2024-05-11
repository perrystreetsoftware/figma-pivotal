declare type GithubPullRequest = {
  mergeCommit: GithubCommit
}

declare type GithubRepo = {
  name: string
}

declare type GithubCommit = {
  authors: {
    author: {
      email: string,
      name: string,
    }[]
  }
  repository: GithubRepo,
  additions: number,
  deletions: number,
  changedFilesIfAvailable: number,
  message: string,
  messageHeadline: string,
  commitUrl: string,
  authoredDate: string
};
