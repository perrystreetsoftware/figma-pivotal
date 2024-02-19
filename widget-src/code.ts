import groupBy from "ramda/src/groupBy";
import getWeek from "date-fns/getWeek";

import { fetchStoriesByEpic, fetchStoriesByPeriod, fetchStoriesByOwnerId } from "./pivotal";
import pivotalSticky from "./pivotalSticky";
import { createFrame, transferStickiesToSections } from "./frame";
import { loadAllFonts } from "./fonts";
import { users } from "./users";

const byWeek = groupBy(({ accepted_at }: PivotalStory): string => {
  if (!accepted_at) return "Not Accepted";

  const acceptedAt = new Date(accepted_at);
  const acceptedAtFormat = Intl.DateTimeFormat("en-US", {month: "short", year: "numeric" }).format(acceptedAt);
  return `W${getWeek(acceptedAt)} ${acceptedAtFormat}`;
});

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
      return fetchStoriesByOwnerId(
      parameters!.pivotalToken,
      parseInt(parameters!.pivotalProjectId, 10),
      users[parameters!.owner].pivotal_id!
    );
  }
};

figma.on("run", async ({ command, parameters }: RunEvent) => {
  const stories: PivotalStory[] = await commands[command](parameters!);

  const storiesByAcceptedAtWeek: {[key: string]: PivotalStory[]} = byWeek(stories);

  await loadAllFonts();

  const parentFrame = createFrame("HORIZONTAL");

  Object.entries(storiesByAcceptedAtWeek).forEach(([week, stories]) => {
    const weekFrame = createFrame("VERTICAL");
    weekFrame.name = week;
    stories.forEach(story => weekFrame.appendChild(pivotalSticky(story)));
    parentFrame.appendChild(weekFrame);
  });

  transferStickiesToSections(parentFrame);

  figma.closePlugin();
});
