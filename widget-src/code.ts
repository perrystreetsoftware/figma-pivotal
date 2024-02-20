import getWeek from "date-fns/getWeek";

import { fetchStoriesByEpic, fetchStoriesByPeriod } from "./pivotal";
import pivotalSticky from "./pivotalSticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { users } from "./users";

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
    const month = Intl.DateTimeFormat("en-US", {month: "short", year: "numeric" }).format(acceptedAt);
    const week = `W${getWeek(acceptedAt)}`;
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
    const pivotalId = users[parameters!.pivotalOwner].pivotal_id!;
    const stories = await this.byDate(parameters);
    return stories.filter(({owner_ids, reviews}) => owner_ids.includes(pivotalId) || reviews.some(({reviewer_id}) => reviewer_id == pivotalId));
  }
};

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
