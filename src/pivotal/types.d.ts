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
  projected_completion?: string,
  completed_at?: string,
  label: PivotalLabel
}
