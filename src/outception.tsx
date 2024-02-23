import format from "date-fns/lightFormat";

import PivotalSticky from "./pivotal/sticky";
import PivotalStats from "./pivotal/stats";
import GithubSticky from "./github/sticky";
import GithubStats from "./github/stats";
import { FrameToSection, Frame } from "./components/frame";
import { users, teams } from "./config/config";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

const dateFormat = (date: string): string => format(new Date(date), "yyyy/MM/dd");

function mapSorted<T>(sortable: {[key: string]: T}, callback: (key: string, value: T) => any): any[] {
  const sort = (a: [string, T], b: [string, T]) => a[0].localeCompare(b[0]);
  return Object.entries(sortable).sort(sort).map(([key, value]) => callback(key, value));
}

const title: {[command: string]: (parameters: ParameterValues) => string} = {
  byEpic: ({pivotalEpicId, pivotalProject}: ParameterValues) => `Outception for Epic "${pivotalEpicId}" in Project "${teams[pivotalProject].name}"`,
  byDate: ({pivotalProject, startDate, endDate}: ParameterValues) => `Outception for Project "${teams[pivotalProject].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}`,
  byOwner: ({owner, period: {startDate, endDate}}: ParameterValues) => `Outception for "${users[owner].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}"`
}

export default function outception(storiesAndCommits: ByMonthWeek, command: string, parameters: ParameterValues): SectionNode {
  return (
    <FrameToSection>
      <Frame layoutMode="VERTICAL" separationMultiple={5} name={title[command](parameters)} color={figJamBaseLight.lightGray}>
        <Frame layoutMode="HORIZONTAL" separationMultiple={3} name="Stats" group>
          <PivotalStats storiesAndCommits={storiesAndCommits} />
          {(command === "byOwner") && <GithubStats storiesAndCommits={storiesAndCommits} />}
        </Frame>

        <Frame layoutMode="HORIZONTAL" separationMultiple={3} name="Stories and Commits" group>

        {mapSorted<ByMonthWeek[0]>(storiesAndCommits, (month, monthStoriesAndCommits) => (
          <Frame layoutMode="HORIZONTAL" separationMultiple={3} name={month} color={figJamBaseLight.lightViolet}>

            {mapSorted<StoryCommits>(monthStoriesAndCommits, (week, {stories, commits}) => (
              <Frame layoutMode="HORIZONTAL" separationMultiple={2} name={week} color={figJamBase.violet}>
                
              {(stories.length > 0) && (
                <Frame layoutMode="VERTICAL" separationMultiple={1} name="Stories" group>
                  {stories.map(story => <PivotalSticky story={story} />)}
                </Frame>
              )}

              {(commits.length > 0) && (
                <Frame layoutMode="VERTICAL" separationMultiple={1} name="Commits" group>
                  {commits.map(commit => <GithubSticky commit={commit} />)}
                </Frame>
              )}

              </Frame>
            ))}
          </Frame>
        ))}
        </Frame>
      </Frame>
    </FrameToSection>
  );
}
