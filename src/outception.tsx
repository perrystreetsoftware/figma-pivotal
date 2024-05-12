import PivotalSticky from "./pivotal/sticky";
import PivotalStats from "./pivotal/stats";
import GithubSticky from "./github/sticky";
import GithubStats from "./github/stats";
import { FrameToSection, SectionFrame } from "./components/frame";
import CheckIn from "./byOwner/checkIn";
import WeeklyUpdates from "./byOwner/weeklyUpdates";
import { dateFormat } from "./date";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function mapSorted<T>(sortable: Record<string, T>, callback: (key: string, value: T) => FigmaDeclarativeChildren<FrameNode>): FigmaDeclarativeChildren<FrameNode>[] {
  return Object.keys(sortable).sort().map(key => callback(key, sortable[key]));
}

const title: {[command: string]: (parameters: ParameterValues) => string} = {
  byEpic: ({pivotalEpic, pivotalProject}: ParameterValues) => `Outception for Epic "${pivotalEpic.name}" in Project "${pivotalProject.name}"`,
  byDate: ({pivotalProject, startDate, endDate}: ParameterValues) => `Outception for Project "${pivotalProject.name}" from ${dateFormat(new Date(startDate))} to ${dateFormat(new Date(endDate))}`,
  byOwner: ({owner, period: {startDate, endDate}}: ParameterValues) => `Outception for "${owner.name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}"`
}

export default function outception(data: DataByMonthWeek, command: string, parameters: ParameterValues): SectionNode {
  return (
    <FrameToSection>
      <SectionFrame layoutMode="VERTICAL" separationMultiple={5} name={title[command](parameters)} color={figJamBaseLight.lightGray}>
        <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name="Stats" noSection>
          <PivotalStats storiesAndCommits={data} epic={parameters.pivotalEpic} />
          {(command === "byOwner") && <GithubStats storiesAndCommits={data} />}
        </SectionFrame>

        <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name="Stories and Commits" noSection>

          {mapSorted<DataByMonthWeek[0]>(data, (month, monthData) =>
            <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name={month} color={figJamBaseLight.lightViolet}>

              {(command === "byOwner") && <WeeklyUpdates month={month} />}

              {mapSorted<Data>(monthData, (week, {stories, commits, otherStories}) =>
                <SectionFrame layoutMode="HORIZONTAL" separationMultiple={2} name={week} color={figJamBase.violet}>
                
                {(stories.length > 0) &&
                  <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name="Stories" noSection>
                    {stories.map(story => <PivotalSticky story={story} />)}
                  </SectionFrame>
                }

                {(commits.length > 0) &&
                  <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name="Commits" noSection>
                    {commits.map(commit => <GithubSticky commit={commit} />)}
                  </SectionFrame>
                }

                {(otherStories.length > 0) &&
                  <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name="Other Stories" noSection>
                    {otherStories.map(stories => <PivotalSticky story={stories} color={figJamBase.white} />)}
                  </SectionFrame>
                }

                </SectionFrame>
              )}

            </SectionFrame>
          )}

        </SectionFrame>

        {(command === "byOwner") && <CheckIn />}
      </SectionFrame>
    </FrameToSection>
  );
}
