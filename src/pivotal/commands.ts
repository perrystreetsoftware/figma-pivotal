import format from "date-fns/format";

import { fetchStoriesByEpic, fetchStoriesByPeriod } from "./fetch";
import { users, teams } from "../config";

export function groupPivotalByMonthAndWeek(result: ByMonthWeek, stories: PivotalStory[])  {
  for (const story of stories) {
    if (!story.accepted_at) {
      result["Not Accepted"] ||= {};
      result["Not Accepted"]["n/a"] ||= {stories: [], prs: []};
      result["Not Accepted"]["n/a"].stories.push(story);
      continue;
    }

    const acceptedAt = new Date(story.accepted_at);
    const month = format(acceptedAt, "MMM yyyy");
    const week = `W${format(acceptedAt, "w")}`;
    result[month] ||= {};
    result[month][week] ||= {stories: [], prs: []};
    result[month][week].stories.push(story);
  }
}

export const pivotalCommands: {[key: string]: (parameters: ParameterValues) => Promise<PivotalStory[]>} = {
  async byEpic(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByEpic(parameters!.pivotalToken, parameters!.pivotalEpicId);
  },
  async byDate(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByPeriod(
      parameters!.pivotalToken,
      teams[parameters!.pivotalProject].pivotal_project_id,
      new Date(parameters!.startDate),
      new Date(parameters!.endDate)
    );
  },
  async byOwner(parameters: ParameterValues): Promise<PivotalStory[]> {
    const user = users[parameters!.owner];
    const pivotalId = user.pivotal_id!;
    const stories = await Promise.all(user.pivotal_projects!.map(async (projectName) => {
      const {pivotal_project_id} = teams[projectName];
      return this.byDate({...parameters, pivotalProjectId: pivotal_project_id.toString()});
    }));
    return stories.flat().filter(({owner_ids, reviews}) => owner_ids.includes(pivotalId) || reviews.some(({reviewer_id}) => reviewer_id == pivotalId));
  }
};