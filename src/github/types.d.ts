declare type GithubPullRequest = {
  id: number,
  title: string,
  url: string,
  created_at: string,
  closed_at: string,
  merged_at: string,
  user: {
    login: string
  }
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
