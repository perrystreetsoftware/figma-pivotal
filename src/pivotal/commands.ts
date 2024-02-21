import { fetchStoriesByEpic, fetchStoriesByPeriod } from "./fetch";
import { users, teams } from "../config";

export default {
  async byEpic(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByEpic(parameters!.pivotalToken, parameters!.pivotalEpicId);
  },

  async byDate(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByPeriod(
      parameters!.pivotalToken,
      parameters!.pivotalProjectId || teams[parameters!.pivotalProject].pivotal_project_id,
      new Date(parameters!.startDate),
      new Date(parameters!.endDate)
    );
  },

  async byOwner(parameters: ParameterValues): Promise<PivotalStory[]> {
    const user = users[parameters!.owner];
    const pivotalId = user.pivotal_id!;
    const stories = await Promise.all(user.pivotal_projects!.map(async (projectName) => {
      const {pivotal_project_id} = teams[projectName];
      return this.byDate({...parameters, ...parameters!.period, pivotalProjectId: pivotal_project_id.toString()});
    }));
    return stories.flat().filter(({owner_ids, reviews}) => owner_ids.includes(pivotalId) || reviews.some(({reviewer_id}) => reviewer_id == pivotalId));
  }
} as {[key: string]: (parameters: ParameterValues) => Promise<PivotalStory[]>};
