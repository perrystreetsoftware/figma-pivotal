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
  started_time: "Working",
  finished_time: "Delivering",
  delivered_time: "Acceptance",
  rejected_time: "Rejection",
  total_cycle_time: "Total",
  rejected_count: "Rejected #"
};

const timeToMs = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  days: 1000 * 60 * 60 * 24
}

const cycleTimeBufferHrs = 12;

const cycleTimeThresholds: { [key: string]: {[key: number]: number} } = {
  feature: [0, 1, 2, 3, 5, 8, 13].reduce<{[key: number]: number}>((memo, i) => (memo[i] = ((i * 24) + cycleTimeBufferHrs) * timeToMs.hours, memo), {}),
  bug: { 0: (48 + cycleTimeBufferHrs) * timeToMs.hours},
  chore: { 0: (24 + cycleTimeBufferHrs) * timeToMs.hours},
  release: { 0: (24 + cycleTimeBufferHrs) * timeToMs.hours},
};

function msToDuration(ms: number) {
  const seconds = +(ms / timeToMs.seconds).toFixed(1),
    minutes = +(ms / timeToMs.minutes).toFixed(1),
    hours = +(ms / timeToMs.hours).toFixed(1),
    days = +(ms / timeToMs.days).toFixed(1);

  if (seconds < 60) return `${seconds} secs`;
  else if (minutes < 60) return `${minutes} mins`;
  else if (hours < 24) return `${hours} hrs`;
  else return `${days} Days`
}

function cycleTimeThresholdColor(story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails): string {
  if (cycleTimeKey === "started_time") {
    if (story.cycle_time_details[cycleTimeKey] >= cycleTimeThresholds[story.story_type][story.estimate || 0]) {
      return figJamBase.red;
    }
  } else if (story.cycle_time_details[cycleTimeKey] >= timeToMs.days) {
    return figJamBase.red;
  }

  return figJamBase.black;
}

function cycleTimeDetails(sticky: Sticky, story: PivotalStory, cycleTimeKey: keyof PivotalCycleTimeDetails) {
  if (story.cycle_time_details[cycleTimeKey] <= 0) return;

  sticky.textWithFormatting(() => {
    sticky.textWithFormatting(`${cycleTimeHeaders[cycleTimeKey]}: `, {fontName: fontInterItalic});
    sticky.textWithFormatting(`${msToDuration(story.cycle_time_details[cycleTimeKey])}\n`, {fill: cycleTimeThresholdColor(story, cycleTimeKey)});
  }, {listType: "UNORDERED"});
}

export function pivotalSticky(story: PivotalStory): StickyNode {
  const sticky = new Sticky();
  
  sticky.text(`${storyTypeEmoji[story.story_type]} `);
  sticky.textWithFormatting(story.name.replace(releaseLinkRegex, ""), {fontName: fontInterBold, url: story.url}); 
  sticky.text("\n\n");
  if (story.story_type === "feature") {
    sticky.textWithFormatting(() => {
      sticky.textWithFormatting("Estimate: ", {fontName: fontInterItalic});
      sticky.text(`${story.estimate}\n`);
    }, {listType: "UNORDERED"});
  }

  const cycleTimesToDisplay: (keyof PivotalCycleTimeDetails)[] = ["started_time", "finished_time", "delivered_time", "rejected_time"];
  cycleTimesToDisplay.forEach(cycleTimeKey => cycleTimeDetails(sticky, story, cycleTimeKey));

  if (story.labels.length > 0) {
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
