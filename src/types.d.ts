declare type StoryCommits = {
  stories: PivotalStory[],
  commits: GithubCommit[]
}

declare type ByMonthWeek = Record<string, Record<string, StoryCommits>>;
