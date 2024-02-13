declare type PivotalStoryType = "feature" | "bug" | "chore" | "release";

declare type PivotalState = "accepted" | "delivered" | "finished" | "started" | 
  "rejected" | "planned" | "unstarted" | "unscheduled";

declare type PivotalLabel = {
  id: number,
  name: string
}

declare type PivotalStoryTransition = {
  state: PivotalState,
  occurred_at: string,
}

declare type PivotalCycleTimeDetails = {
  total_cycle_time: number,
  started_time: number,
  finished_time: number,
  delivered_time: number,
  rejected_time: number,
  rejected_count: number
}

declare type PivotalStory = {
  id: number,
  name: string,
  url: string,
  story_type: PivotalStoryType,
  labels: PivotalLabel[],
  cycle_time_details: PivotalCycleTimeDetails,
  transitions: PivotalStoryTransition[],
  accepted_at: string,
  estimate: number
}

declare type PivotalEpic = {
  id: number,
  name: string,
  url: string,
  project_id: number,
  label: PivotalLabel
}

declare type Format = {
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