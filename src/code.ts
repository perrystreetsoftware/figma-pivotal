import format from "date-fns/format";

import { fetchStoriesByEpic, fetchStoriesByPeriod } from "./pivotal";
import pivotalSticky from "./pivotalSticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { users, teams } from "./users";

type StoriesByMonthWeek = {
  [key: string]: {
    [key: string]: PivotalStory[]
  }
};

function byMonthAndWeek(stories: PivotalStory[]): StoriesByMonthWeek  {
  const result: StoriesByMonthWeek = {};

  for (const story of stories) {
    if (!story.accepted_at) {
      result["Not Accepted"] ||= {};
      result["Not Accepted"]["n/a"] ||= [];
      result["Not Accepted"]["n/a"].push(story);
      continue;
    }

    const acceptedAt = new Date(story.accepted_at);
    const month = format(acceptedAt, "MMM yyyy");
    const week = `W${format(acceptedAt, "w")}`;
    result[month] ||= {};
    result[month][week] ||= [];
    result[month][week].push(story);
  }

  return result;
}

const commands: {[key: string]: (parameters: ParameterValues) => Promise<PivotalStory[]>} = {
  async byEpic(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByEpic(
      parameters!.pivotalToken,
      parseInt(parameters!.pivotalEpicId.replace(/\D/g, ""), 10)
    );
  },
  async byDate(parameters: ParameterValues): Promise<PivotalStory[]> {
    return fetchStoriesByPeriod(
      parameters!.pivotalToken,
      parseInt(parameters!.pivotalProjectId, 10),
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

figma.parameters.on("input", ({ key, query, result }: ParameterInputEvent) => {
  if (key === "owner") {
      const owners = Object.keys(users);
      result.setSuggestions(owners.filter(s => s.includes(query)));
  }
});

figma.on("run", async ({ command, parameters }: RunEvent) => {
  const stories = await commands[command](parameters!);

  const storiesByAcceptedAtWeek = byMonthAndWeek(stories);

  await loadAllFonts();

  const parentFrame = createFrame("HORIZONTAL", 5);
  parentFrame.name = "Outception";

  Object.entries(storiesByAcceptedAtWeek).forEach(([month, weeks]) => {
    const monthFrame = createFrame("HORIZONTAL", 3);
    monthFrame.name = month;

    Object.entries(weeks).forEach(([week, stories]) => {
      const weekFrame = createFrame("VERTICAL", 1);
      weekFrame.name = week;
      stories.forEach(story => weekFrame.appendChild(pivotalSticky(story)));
      monthFrame.appendChild(weekFrame);
    });

    parentFrame.appendChild(monthFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
