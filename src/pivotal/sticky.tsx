import { fonts } from "../fonts";
import { Sticky, Text, Br } from "../components/sticky";
import CycleTime from "./cycleTime";

type PivotalStickyProps = { story: PivotalStory, color?: string };

const { figJamBaseLight, figJamBase } = figma.constants.colors;

const releaseLinkRegex = / \*\*\[(Android|iOS): \d+\]\(.+\)\*\*/;

const storyTypeEmoji: Record<PivotalStoryType, string> = {
  feature: "⭐️",
  bug: "🐞",
  chore: "⚙️",
  release: "🚀",
};

const storyTypeColor: Record<PivotalStoryType, string> = {
  feature: figJamBaseLight.lightYellow,
  bug: figJamBaseLight.lightRed,
  chore: figJamBaseLight.lightGray,
  release: figJamBaseLight.lightBlue,
};

export default function PivotalSticky({ story, color }: PivotalStickyProps): StickyNode {
  return (
    <Sticky fill={color || storyTypeColor[story.story_type]}>
      <Text>{storyTypeEmoji[story.story_type]} </Text>
      <Text format={{ fontName: fonts.interBold, url: story.url }} newLine>{story.name.replace(releaseLinkRegex, "")}</Text>
      <Br />

      {story.story_type === "feature" && (
        <Text format={{ listType: "UNORDERED" }}>
          <Text format={{ fontName: fonts.interItalic }}>Estimate: </Text>
          <Text newLine>{story.estimate ? story.estimate.toLocaleString() : 'Not Estimated'}</Text>
        </Text>
      )}

      <CycleTime story={story} cycleTimeKey="started_time" />
      <CycleTime story={story} cycleTimeKey="finished_time" />
      <CycleTime story={story} cycleTimeKey="delivered_time" />
      <CycleTime story={story} cycleTimeKey="rejected_time" />

      {story.labels.length > 0 && (
        <Text format={{ lineHeight: 15, fontSize: 12 }} newLine>
          <Br />
          <Text>| </Text>
          {story.labels.map(({ name }) => (
            <Text key={name}>
              <Text format={{fill: figJamBase.green, url: `https://www.pivotaltracker.com/n/projects/${story.project_id}/search?q=${encodeURI(`label:"${name}"`)}`}}>
                {name}
              </Text>
              <Text> | </Text>
            </Text>
          ))}
        </Text>
       )}
    </Sticky>
  );
}
