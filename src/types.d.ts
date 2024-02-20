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

declare type ByMonthWeek = {
  [key: string]: {
    [key: string]: {
      stories: PivotalStory[],
      prs: GithubPr[]
    }
  }
};
