declare type GithubPr = {
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
