import { fetchStoriesByEpic, fetchStoriesByFilter, fetchStoriesByPeriod } from "./fetch";
import { teams } from "../config/config";
import { dateFormat } from "../date";

function findLast<T>(arr: T[], pred: (el: T) => boolean): T | undefined {
  if (typeof arr.findLast === 'function') return arr.findLast(pred);

  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) return arr[i];
  }
}

export async function byEpic(pivotalToken: string, pivotalEpic: PivotalEpic): Promise<Data> {
  const stories = await fetchStoriesByEpic(pivotalToken, pivotalEpic);

  pivotalEpic.completed_at ||= pivotalEpic.projected_completion || findLast(stories, ({accepted_at}) => accepted_at !== undefined)!.accepted_at;
  const dateRange = `${dateFormat(stories[0].accepted_at)}..${dateFormat(pivotalEpic.completed_at)}`;
  const filter = `-epic:"${pivotalEpic.label.name}" AND accepted:"${dateRange}"`;
  const otherStories = await fetchStoriesByFilter(pivotalToken, pivotalEpic.project_id, filter);

  return { stories, otherStories, dateRange, commits: [] };
}

export async function byDate(pivotalToken: string, { pivotal_project_id }: PSSTeam, startDate: Date, endDate: Date): Promise<PivotalStory[]> {
  return fetchStoriesByPeriod(pivotalToken, pivotal_project_id, startDate, endDate);
}

export async function byOwner(pivotalToken: string, { pivotal_id, pivotal_projects }: PSSUser, startDate: Date, endDate: Date): Promise<PivotalStory[]> {
  const stories = await Promise.all(pivotal_projects.map(project => fetchStoriesByPeriod(pivotalToken, teams[project].pivotal_project_id, startDate, endDate)));
  return stories.flat().filter(({owner_ids, reviews}) => owner_ids.includes(pivotal_id) || reviews.some(({reviewer_id}) => reviewer_id == pivotal_id));
}
