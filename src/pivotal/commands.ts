import { fetchEpic, fetchStoriesByEpic, fetchStoriesByFilter, fetchStoriesByPeriod } from "./fetch";
import { users, teams } from "../config/config";

export async function byEpic(pivotalToken: string, pivotalEpicId: number): Promise<Data> {
  const epic = await fetchEpic(pivotalToken, pivotalEpicId);
  const stories = await fetchStoriesByEpic(pivotalToken, epic);
  const dateRange = `${stories[0].accepted_at}..${epic.projected_completion}`
  const filter = `-epic:"${epic.label.name}" AND accepted:${dateRange}`;
  const otherStories = await fetchStoriesByFilter(pivotalToken, epic.project_id, filter);

  return { stories, otherStories, dateRange, commits: [] };
}

export async function byDate(parameters: ParameterValues): Promise<PivotalStory[]> {
  return fetchStoriesByPeriod(
    parameters.pivotalToken,
    parameters.pivotalProjectId || teams[parameters.pivotalProject].pivotal_project_id,
    new Date(parameters.startDate),
    new Date(parameters.endDate)
  );
}

export async function byOwner(parameters: ParameterValues): Promise<PivotalStory[]> {
  const user = users[parameters.owner];
  const pivotalId = user.pivotal_id!;
  const stories = await Promise.all(user.pivotal_projects!.map(async (projectName) => {
    const {pivotal_project_id} = teams[projectName];
    return byDate({...parameters, ...parameters.period, pivotalProjectId: pivotal_project_id.toString()}) as Promise<PivotalStory[]>;
  }));
  return stories.flat().filter(({owner_ids, reviews}) => owner_ids.includes(pivotalId) || reviews.some(({reviewer_id}) => reviewer_id == pivotalId));
}
