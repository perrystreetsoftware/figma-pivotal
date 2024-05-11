declare type Data = {
  stories: PivotalStory[],
  otherStories: PivotalStory[],
  commits: GithubCommit[],
  dateRange?: string
}

declare type DataByMonthWeek = Record<string, Record<string, Data>>;
