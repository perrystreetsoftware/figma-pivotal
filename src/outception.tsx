import format from "date-fns/lightFormat";

import PivotalSticky from "./pivotal/sticky";
import PivotalStats from "./pivotal/stats";
import GithubSticky from "./github/sticky";
import GithubStats from "./github/stats";
import { FrameToSection, Frame } from "./components/frame";
import { users, teams } from "./config/config";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function dateFormat(date: string): string {
  return format(new Date(date), "yyyy/MM/dd");
}

const title: {[command: string]: (parameters: ParameterValues) => string} = {
  byEpic: ({pivotalEpicId, pivotalProject}: ParameterValues) => `Outception for Epic "${pivotalEpicId}" in Project "${teams[pivotalProject].name}"`,
  byDate: ({pivotalProject, startDate, endDate}: ParameterValues) => `Outception for Project "${teams[pivotalProject].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}`,
  byOwner: ({owner, period: {startDate, endDate}}: ParameterValues) => `Outception for "${users[owner].name}" from ${dateFormat(startDate)} to ${dateFormat(endDate)}"`
}

function CommitOrStory({storiesOrCommits}:  {storiesOrCommits: StoryCommits}): FrameNode[] {
  let nodes: FrameNode[] = [];
  if (storiesOrCommits.stories.length > 0) {
    nodes.push(
      <Frame layoutMode="VERTICAL" separationMultiple={1} name="Stories" group>
        {storiesOrCommits.stories.map(story => <PivotalSticky story={story} />)}
      </Frame>
    );
  }

  if (storiesOrCommits.commits.length > 0) {
    nodes.push(
      <Frame layoutMode="VERTICAL" separationMultiple={1} name="Commits" group>
        {storiesOrCommits.commits.map(commit => <GithubSticky commit={commit} />)}
      </Frame>
    );
  }
  return nodes;
}

export default function outception(storiesAndCommits: ByMonthWeek, command: string, parameters: ParameterValues): SectionNode {
  return (
    <FrameToSection>
      <Frame layoutMode="VERTICAL" separationMultiple={5} name={title[command](parameters)} color={figJamBaseLight.lightGray}>
        <Frame layoutMode="HORIZONTAL" separationMultiple={3} name="Stats" group>
          <PivotalStats storiesAndCommits={storiesAndCommits} />
          {command === "byOwner" && <GithubStats storiesAndCommits={storiesAndCommits} />}
        </Frame>
        <Frame layoutMode="HORIZONTAL" separationMultiple={3} name="Stories and Commits" group>
        {Object.keys(storiesAndCommits).sort().map(month => (
          <Frame layoutMode="HORIZONTAL" separationMultiple={3} name={month} color={figJamBaseLight.lightViolet}>
            {Object.keys(storiesAndCommits[month]).sort().map(week => (
              <Frame layoutMode="HORIZONTAL" separationMultiple={2} name={week} color={figJamBase.violet}>
                <CommitOrStory storiesOrCommits={storiesAndCommits[month][week]} />
              </Frame>
            ))}
          </Frame>
        ))}
        </Frame>
      </Frame>
    </FrameToSection>
  );
}
