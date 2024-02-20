import { millisecondsInHour, millisecondsInDay } from "date-fns/constants";

import { fonts } from "../fonts";
import Sticky from "../sticky";
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

function cycleTimeDetails(sticky: Sticky, story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails) {
  if (story.cycle_time_details[cycleTimeKey] <= 0) return;

  sticky.text("\n")
  sticky.textWithFormatting(() => {
    sticky.textWithFormatting(`${cycleTimeHeaders[cycleTimeKey]}: `, {fontName: fonts.interItalic});
    sticky.textWithFormatting(formatDuration(story.cycle_time_details[cycleTimeKey]), {fill: cycleTimeThresholdColor(story, cycleTimeKey)});
    if (cycleTimeKey === "started_time" || cycleTimeKey === "delivered_time") {
      sticky.textWithFormatting(` by ${toSentence(developers(story, cycleTimeKey === "delivered_time"))}`, {fontSize: 10});
    }
  }, {listType: "UNORDERED"});
}

function developers({owner_ids, reviews}: PivotalStory, qa: boolean): string[] {
  const all: number[] = Array.from(new Set(owner_ids.map(id => id).concat(reviews.map(({reviewer_id}) => reviewer_id))));
  return all
    .filter(id => usersByPivotalId[id])
    .filter(id => qa === (usersByPivotalId[id].type || "").includes("QA"))
    .map(id => usersByPivotalId[id].name!);
}

export default function pivotalSticky(story: PivotalStory): StickyNode {
  const sticky = new Sticky();
  
  sticky.text(`${storyTypeEmoji[story.story_type]} `);
  sticky.textWithFormatting(story.name.replace(releaseLinkRegex, ""), {fontName: fonts.interBold, url: story.url});
  sticky.text("\n");

  if (story.story_type === "feature") {
    sticky.text("\n");
    sticky.textWithFormatting(() => {
      sticky.textWithFormatting("Estimate: ", {fontName: fonts.interItalic});
      sticky.text(`${story.estimate}`);
    }, {listType: "UNORDERED"});
  }

  const cycleTimesToDisplay: (keyof PivotalCycleTimeDetails)[] = ["started_time", "finished_time", "delivered_time", "rejected_time"];
  cycleTimesToDisplay.forEach(cycleTimeKey => cycleTimeDetails(sticky, story, cycleTimeKey));

  if (story.labels.length > 0) {
    sticky.text("\n");
    sticky.textWithFormatting(() => {
      sticky.text("\n| ");
      story.labels.forEach(({name}) => {
        const url = `https://www.pivotaltracker.com/n/projects/${story.project_id}/search?q=${encodeURI(`label:"${name}"`)}`;
        sticky.textWithFormatting(name, {fill: figJamBase.green, url});
        sticky.text(" | ");
      });
    }, {lineHeight: 15, fontSize: 10});
  }

  sticky.fill(storyTypeColor[story.story_type]);
  sticky.setPluginData("pivotalStory", JSON.stringify(story));
  sticky.authorVisible(false);

  return sticky.getNode();
}
