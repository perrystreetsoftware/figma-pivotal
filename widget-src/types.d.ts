declare type PivotalStoryType = "feature" | "bug" | "chore" | "release";

declare type PivotalState = "accepted" | "delivered" | "finished" | "started" | 
  "rejected" | "planned" | "unstarted" | "unscheduled";

declare type PivotalReviewStatus = "unstarted" | "in_review" | "pass" | "revise";

declare type PivotalLabel = {
  id: number,
  name: string
}

declare type PivotalCycleTimeDetails = {
  total_cycle_time: number,
  started_time: number,
  finished_time: number,
  delivered_time: number,
  rejected_time: number,
  rejected_count: number
}

declare type PivotalReview = {
  id: number,
  reviewer_id: number,
  status: PivotalReviewStatus
}

declare type PivotalStory = {
  id: number,
  name: string,
  url: string,
  accepted_at: string,
  estimate: number,
  project_id: number,
  owner_ids: number[],
  story_type: PivotalStoryType,
  labels: PivotalLabel[],
  cycle_time_details: PivotalCycleTimeDetails,
  reviews: PivotalReview[]
}

declare type PivotalEpic = {
  id: number,
  name: string,
  url: string,
  project_id: number,
  label: PivotalLabel
}

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