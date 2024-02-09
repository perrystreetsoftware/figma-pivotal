import { fontInterBold, fontInterItalic } from "./fonts";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function msToDuration(ms: number) {
  const seconds = +(ms / 1000).toFixed(1),
    minutes = +(ms / (1000 * 60)).toFixed(1),
    hours = +(ms / (1000 * 60 * 60)).toFixed(1),
    days = +(ms / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) return `${seconds} secs`;
  else if (minutes < 60) return `${minutes} mins`;
  else if (hours < 24) return `${hours} hrs`;
  else return `${days} Days`
}

function setFontFor(text: TextSublayerNode, searchString: string, startBuffer: number, endBuffer: number, font: FontName = fontInterBold) {
  const startIndex = text.characters.indexOf(searchString);
  if (startIndex === -1) return;

  text.setRangeFontName(startIndex + startBuffer, startIndex + searchString.length + endBuffer, font);
}

const storyTypeEmoji: { [key in PivotalStoryType]: string } = {
  feature: "⭐️",
  bug: "🐞",
  chore: "⚙️",
  release: "🚀",
};

const storyTypeColor: { [key in PivotalStoryType]: SolidPaint } = {
  feature: figma.util.solidPaint(figJamBaseLight.lightYellow),
  bug: figma.util.solidPaint(figJamBaseLight.lightRed),
  chore: figma.util.solidPaint(figJamBaseLight.lightGray),
  release: figma.util.solidPaint(figJamBaseLight.lightBlue),
};

const headers = {
  estimate: "- Estimate: ",
  working: "- In Working: ",
  delivering: "- In Delivering: ",
  accepting: "- In Acceptance: ",
  rejecting: "- In Rejection: "
}

export function createSticky(story: PivotalStory): StickyNode {
  const sticky = figma.createSticky();

  sticky.text.characters = `${storyTypeEmoji[story.story_type]} ${story.name}\n\n`;
  if (story.story_type === "feature") {
    sticky.text.characters += `${headers.estimate}${story.estimate}\n`;
  }
  sticky.text.characters += `${headers.working}${msToDuration(story.cycle_time_details.started_time)}\n`;
  if (story.story_type !== "chore") {
    sticky.text.characters += `${headers.delivering}${msToDuration(story.cycle_time_details.finished_time)}\n`;
    sticky.text.characters += `${headers.accepting}${msToDuration(story.cycle_time_details.delivered_time)}\n`;
  }
  if (story.cycle_time_details.rejected_count > 0) {
    sticky.text.characters += `${headers.rejecting}${msToDuration(story.cycle_time_details.rejected_time)}\n`;
  }
  if (story.labels.length > 0) {
    sticky.text.characters += "\n";
    sticky.text.characters += story.labels.map(({name}) => name).join(", ");
  }

  const startTitle = storyTypeEmoji[story.story_type].length + 1;
  sticky.text.setRangeHyperlink(startTitle, startTitle + story.name.length, {type: "URL", value: story.url});
  setFontFor(sticky.text, story.name, 0, 0);
  Object.values(headers).forEach(searchString => setFontFor(sticky.text, searchString, 2, -1, fontInterItalic));
  story.labels.forEach(label => {
    const startLabel = sticky.text.characters.indexOf(label.name);
    sticky.text.setRangeFills(startLabel, startLabel + label.name.length, [figma.util.solidPaint(figJamBase.green)]);
    sticky.text.setRangeFontSize(startLabel, startLabel + label.name.length, 10);
  });
  // sticky.text.getStyledTextSegments(["fontName", "hyperlink"]).forEach(console.log);

  sticky.fills = [storyTypeColor[story.story_type]];
  sticky.setPluginData("pivotalStory", JSON.stringify(story));

  return sticky;
}
