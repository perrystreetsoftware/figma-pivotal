import { millisecondsInHour, millisecondsInDay } from "date-fns/constants";
import { fontInterBold, fontInterItalic } from "./fonts";
import Sticky from "./sticky";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

const releaseLinkRegex = / \*\*\[(Android|iOS): \d+\]\(.+\)\*\*/;

const storyTypeEmoji: { [key in PivotalStoryType]: string } = {
  feature: "⭐️",
  bug: "🐞",
  chore: "⚙️",
  release: "🚀",
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

const cycleTimeThresholds: { [key: string]: {[key: number]: number} } = {
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

function cycleTimeThresholdColor(story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails): string {
  if (cycleTimeKey === "started_time") {
    if (story.cycle_time_details[cycleTimeKey] >= cycleTimeThresholds[story.story_type][story.estimate || 0]) {
      return figJamBase.red;
    }
  } else if (story.cycle_time_details[cycleTimeKey] >= millisecondsInDay) {
    return figJamBase.red;
  }

  return figJamBase.black;
}

function cycleTimeDetails(sticky: Sticky, story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails) {
  if (story.cycle_time_details[cycleTimeKey] <= 0) return;

  sticky.text("\n")
  sticky.textWithFormatting(() => {
    sticky.textWithFormatting(`${cycleTimeHeaders[cycleTimeKey]}: `, {fontName: fontInterItalic});
    sticky.textWithFormatting(formatDuration(story.cycle_time_details[cycleTimeKey]), {fill: cycleTimeThresholdColor(story, cycleTimeKey)});
  }, {listType: "UNORDERED"});
}

export default function pivotalSticky(story: PivotalStory): StickyNode {
  const sticky = new Sticky();
  
  sticky.text(`${storyTypeEmoji[story.story_type]} `);
  sticky.textWithFormatting(story.name.replace(releaseLinkRegex, ""), {fontName: fontInterBold, url: story.url}); 
  sticky.text("\n");

  if (story.story_type === "feature") {
    sticky.text("\n");
    sticky.textWithFormatting(() => {
      sticky.textWithFormatting("Estimate: ", {fontName: fontInterItalic});
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
        sticky.textWithFormatting(name, {fill: figJamBase.green});
        sticky.text(" | ");
      });
    }, {lineHeight: 15, fontSize: 10});
  }

  sticky.fill(storyTypeColor[story.story_type]);
  sticky.setPluginData("pivotalStory", JSON.stringify(story));
  sticky.authorVisible(false);

  return sticky.getNode();
}
