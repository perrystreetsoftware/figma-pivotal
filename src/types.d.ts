declare type Data = {
  stories: PivotalStory[],
  otherStories: PivotalStory[],
  commits: GithubCommit[],
}

declare type DataByMonthWeek = Record<string, Record<string, Data>>;
