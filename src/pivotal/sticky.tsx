import { millisecondsInHour, millisecondsInDay } from "date-fns/constants";

import { fonts } from "../fonts";
import { Sticky, Text, Br } from "../sticky";
import { usersByPivotalId } from "../config";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

const releaseLinkRegex = / \*\*\[(Android|iOS): \d+\]\(.+\)\*\*/;

const storyTypeEmoji: { [key in PivotalStoryType]: string } = {
  feature: "⭐️",
  bug: "🐞",
  chore: "⚙️",
  release: "🚀"
};

const storyTypeColor: { [key in PivotalStoryType]: string } = {
  feature: figJamBaseLight.lightYellow,
  bug: figJamBaseLight.lightRed,
  chore: figJamBaseLight.lightGray,
  release: figJamBaseLight.lightBlue,
};

const cycleTimeHeaders: { [key in keyof PivotalCycleTimeDetails]: string } = {
  started_time: "Work",
  finished_time: "Deliver",
  delivered_time: "Accept",
  rejected_time: "Reject",
  total_cycle_time: "Total",
  rejected_count: "Rejected #"
};

const cycleTimeBufferHrs = 12;

const startedTimeThresholds: { [key: string]: {[key: number]: number} } = {
  feature: [0, 1, 2, 3, 5, 8, 13].reduce<{[key: number]: number}>((memo, i) => (memo[i] = ((i * 24) + cycleTimeBufferHrs) * millisecondsInHour, memo), {}),
  bug: { 0: (48 + cycleTimeBufferHrs) * millisecondsInHour},
  chore: { 0: (24 + cycleTimeBufferHrs) * millisecondsInHour},
  release: { 0: (24 + cycleTimeBufferHrs) * millisecondsInHour},
};

function formatDuration(ms: number): string {
  const hours = +(ms / millisecondsInHour).toFixed(1),
    days = +(ms / millisecondsInDay).toFixed(1);

  return hours < 24 ? `${hours} hrs` : `${days} days`
}

function cycleTimeThresholdColor({story_type, cycle_time_details, estimate}: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails): string {
  const thresholds: { [key in keyof PivotalCycleTimeDetails]: number } = {
    started_time: startedTimeThresholds[story_type][estimate || 0],
    total_cycle_time: startedTimeThresholds[story_type][estimate || 0] + (2 * millisecondsInDay),
    finished_time: millisecondsInDay,
    delivered_time: millisecondsInDay,
    rejected_time: 0,
    rejected_count: 0
  }

  return cycle_time_details[cycleTimeKey] > thresholds[cycleTimeKey] ? figJamBase.red : figJamBase.black;
}

function toSentence(parts: string[]): string {
  if (parts.length == 2) return parts.join(' and ');
  return parts.join(', ').replace(/,\s([^,]+)$/, ', and $1');
}

function cycleTimeDetails(story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails) {
  if (story.cycle_time_details[cycleTimeKey] <= 0) return;

  return (
    <Text key={cycleTimeKey} format={{listType: "UNORDERED"}} newLine>
      <Text format={{fontName: fonts.interItalic}}>{cycleTimeHeaders[cycleTimeKey]}: </Text>
      <Text format={{fill: cycleTimeThresholdColor(story, cycleTimeKey)}}>{formatDuration(story.cycle_time_details[cycleTimeKey])}</Text>
      {(cycleTimeKey === "started_time" || cycleTimeKey === "delivered_time") && 
        <Text format={{fontSize: 10}}> by {toSentence(developers(story, cycleTimeKey === "delivered_time"))}</Text>
      }
    </Text>
  );
}

function developers({owner_ids, reviews}: PivotalStory, qa: boolean): string[] {
  const all: number[] = Array.from(new Set(owner_ids.map(id => id).concat(reviews.map(({reviewer_id}) => reviewer_id))));
  return all
    .filter(id => usersByPivotalId[id])
    .filter(id => qa === (usersByPivotalId[id].type || "").includes("QA"))
    .map(id => usersByPivotalId[id].name!);
}

export default function PivotalSticky({story}: {story: PivotalStory}): StickyNode {
  const cycleTimesToDisplay: (keyof PivotalCycleTimeDetails)[] = ["started_time", "finished_time", "delivered_time", "rejected_time"];
  const cycleTimes = cycleTimesToDisplay.map(cycleTimeKey => cycleTimeDetails(story, cycleTimeKey)).filter(cycleTime => cycleTime);

  return (
    <Sticky fill={storyTypeColor[story.story_type]}>
      <Text>{`${storyTypeEmoji[story.story_type]} `}</Text>
      <Text format={{fontName: fonts.interBold, url: story.url}} newLine>{story.name.replace(releaseLinkRegex, "")}</Text>
      <Br />

      {story.story_type === "feature" && 
        <Text format={{listType: "UNORDERED"}}>
          <Text format={{fontName: fonts.interItalic}}>Estimate: </Text>
          <Text newLine>{story.estimate.toLocaleString()}</Text>
        </Text>
      }

      {cycleTimes}

      {story.labels.length > 0 &&
        <Text format={{lineHeight: 15, fontSize: 10}} newLine>
          <Br />
          {story.labels.map(({name}) => (
            <Text key={name}>
              <Text format={{fill: figJamBase.green, url: `https://www.pivotaltracker.com/n/projects/${story.project_id}/search?q=${encodeURI(`label:"${name}"`)}`}}>{name}</Text>
              <Text> | </Text>
            </Text>
          ))}
        </Text>
      }
    </Sticky>
  );
}
