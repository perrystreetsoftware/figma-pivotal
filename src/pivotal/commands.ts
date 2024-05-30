import { fetchStoriesByEpic, fetchStoriesByFilter, fetchStoriesByPeriod } from "./fetch";
import { teams } from "../config/config";

export async function byEpic(pivotalToken: string, pivotalEpic: PivotalEpic): Promise<Data> {
  const stories = await fetchStoriesByEpic(pivotalToken, pivotalEpic);

  pivotalEpic.completed_at ||= pivotalEpic.projected_completion || stories.findLast(({accepted_at}) => accepted_at)?.accepted_at;
  const dateRange = `${stories[0].accepted_at}..${pivotalEpic.completed_at}`
  const filter = `-epic:"${pivotalEpic.label.name}" AND accepted:${dateRange}`;
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
