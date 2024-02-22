declare type FigmaTextFormat = {
  start: number;
  end: number;
  format: {
    fontName?: FontName;
    fill?: string;
    fontSize?: number;
    url?: string;
    listType?: "ORDERED" | "UNORDERED";
    lineHeight?: number;
  }
}

declare type PSSUser = {
  name?: string,
  pivotal_id?: number,
  pivotal_projects?: string[]
  slack_id?: string,
  github_emails?: string[],
  type?: "SERVER" | "ANDROID" | "IOS" | "WEB" | "PRODUCT_QA" | "DEV_QA" | "DESIGN_QA"
}

declare type PSSTeam = {
  name: string,
  slack_channel: string,
  pivotal_project_id: number
}

declare type StoryCommits = {
  stories: PivotalStory[],
  commits: GithubCommit[]
}

declare type ByMonthWeek = {
  [key: string]: {
    [key: string]: StoryCommits
  }
};

declare type PSSPeriod = {
  startDate: string,
  endDate: string,
  t1: {
    startDate: string,
    endDate: string
  },
  t2: {
    startDate: string,
    endDate: string
  },
  t3: {
    startDate: string,
    endDate: string
  }
}
