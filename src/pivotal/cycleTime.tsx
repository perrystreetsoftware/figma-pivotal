import { millisecondsInHour, millisecondsInDay } from "date-fns/constants";

import { fonts } from "../fonts";
import { Text } from "../components/sticky";
import { usersByPivotalId } from "../config/config";

type CycleTimeProps = {
  story: PivotalStory,
  cycleTimeKey: keyof PivotalCycleTimeDetails,
};

const { figJamBase } = figma.constants.colors;

const cycleTimeBufferHrs = 12;

const cycleTimeHeaders: Record<keyof PivotalCycleTimeDetails, string> = {
  started_time: "Work",
  finished_time: "Deliver",
  delivered_time: "Accept",
  rejected_time: "Reject",
  total_cycle_time: "Total",
  rejected_count: "Rejected #"
};

const startedTimeThresholds: Record<string, Record<number, number>> = {
  feature: [0, 1, 2, 3, 5, 8, 13].reduce<{[key: number]: number}>((memo, i) => (memo[i] = ((i * 24) + cycleTimeBufferHrs) * millisecondsInHour, memo), {}),
  bug: { 0: (48 + cycleTimeBufferHrs) * millisecondsInHour},
  chore: { 0: (24 + cycleTimeBufferHrs) * millisecondsInHour},
  release: { 0: (24 + cycleTimeBufferHrs) * millisecondsInHour},
};

function toSentence(parts: string[]): string {
  if (parts.length == 2) return parts.join(' and ');
  return parts.join(', ').replace(/,\s([^,]+)$/, ', and $1');
}

function developers({owner_ids, reviews}: PivotalStory, qa: boolean): string[] {
  const all: number[] = Array.from(new Set(owner_ids.map(id => id).concat(reviews.map(({reviewer_id}) => reviewer_id))));
  return all
    .filter(id => usersByPivotalId[id])
    .filter(id => qa === (usersByPivotalId[id].type || "").includes("QA"))
    .map(id => usersByPivotalId[id].name);
}

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

export default function CycleTime({story, cycleTimeKey}: CycleTimeProps) {
  if (story.cycle_time_details[cycleTimeKey] <= 0) return;

  return (
    <Text key={cycleTimeKey} format={{listType: "UNORDERED"}} newLine>
      <Text format={{fontName: fonts.interItalic}}>{cycleTimeHeaders[cycleTimeKey]}: </Text>
      <Text format={{fill: cycleTimeThresholdColor(story, cycleTimeKey)}}>{formatDuration(story.cycle_time_details[cycleTimeKey])}</Text>
      {(cycleTimeKey === "started_time" || cycleTimeKey === "delivered_time") && 
        <Text format={{fontSize: 12}}> by {toSentence(developers(story, cycleTimeKey === "delivered_time"))}</Text>
      }
    </Text>
  );
}
