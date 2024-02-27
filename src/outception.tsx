import format from "date-fns/lightFormat";

import PivotalSticky from "./pivotal/sticky";
import PivotalStats from "./pivotal/stats";
import GithubSticky from "./github/sticky";
import GithubStats from "./github/stats";
import { FrameToSection, SectionFrame } from "./components/frame";
import { users, teams } from "./config/config";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

const dateFormat = (date: string): string => format(new Date(date), "yyyy/MM/dd");

const mapSorted = <T,>(sortable: {[key: string]: T}, callback: (key: string, value: T) => FigmaDeclarativeChildren<FrameNode>): FigmaDeclarativeChildren<FrameNode>[] => Object.keys(sortable).sort().map(key => callback(key, sortable[key]));

const title: {[command: string]: (parameters: ParameterValues) => string} = {
  byEpic: ({pivotalEpicId, pivotalProject}: ParameterValues) => `Outception for Epic "${pivotalEpicId}" in Project "${teams[pivotalProject].name}"`,
  byDate: ({pivotalProject, startDate, endDate}: ParameterValues) => `Outception for Project "${teams[pivotalProject].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}`,
  byOwner: ({owner, period: {startDate, endDate}}: ParameterValues) => `Outception for "${users[owner].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}"`
}

export default function outception(storiesAndCommits: ByMonthWeek, command: string, parameters: ParameterValues): SectionNode {
  return (
    <FrameToSection>
      <SectionFrame layoutMode="VERTICAL" separationMultiple={5} name={title[command](parameters)} color={figJamBaseLight.lightGray}>
        <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name="Stats" noSection>
          <PivotalStats storiesAndCommits={storiesAndCommits} />
          {(command === "byOwner") && <GithubStats storiesAndCommits={storiesAndCommits} />}
        </SectionFrame>

        <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name="Stories and Commits" noSection>

          {mapSorted<ByMonthWeek[0]>(storiesAndCommits, (month, monthStoriesAndCommits) =>
            <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name={month} color={figJamBaseLight.lightViolet}>

              {mapSorted<StoryCommits>(monthStoriesAndCommits, (week, {stories, commits}) =>
                <SectionFrame layoutMode="HORIZONTAL" separationMultiple={2} name={week} color={figJamBase.violet}>
                
                {(stories.length > 0) && (
                  <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name="Stories" noSection>
                    {stories.map(story => <PivotalSticky story={story} />)}
                  </SectionFrame>
                )}

                {(commits.length > 0) && (
                  <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name="Commits" noSection>
                    {commits.map(commit => <GithubSticky commit={commit} />)}
                  </SectionFrame>
                )}

                </SectionFrame>
              )}

            </SectionFrame>
          )}

        </SectionFrame>
      </SectionFrame>
    </FrameToSection>
  );
}
