declare type StoryCommits = {
  stories: PivotalStory[],
  commits: GithubCommit[]
}

declare type ByMonthWeek = {
  [key: string]: {
    [key: string]: StoryCommits
  }
};