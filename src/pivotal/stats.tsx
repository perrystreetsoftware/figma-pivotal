import { Sticky, Text, Br } from "../components/sticky";
import { fonts } from "../fonts";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function calculateStats(storiesAndCommits: ByMonthWeek) {
  const stats = {
    pointCount: 0,
    feature: 0,
    bug: 0,
    chore: 0,
    release: 0,
  };

  for (const month of Object.values(storiesAndCommits)) {
    for (const {stories} of Object.values(month)) {
      for (const story of stories) {
        if (story.estimate) stats.pointCount += story.estimate;
        stats[story.story_type]++;
      }
    }
  }

  return stats;
}

export default function PivotalStats({storiesAndCommits}: {storiesAndCommits: ByMonthWeek}): StickyNode {
  const stats = calculateStats(storiesAndCommits);
  return (
    <Sticky fill={figJamBaseLight.lightGreen}>
      <Text format={{ fontName: fonts.interBold, fontSize: 28 }} newLine>Pivotal Stats</Text>
      <Br />
      <Text format={{ listType: "UNORDERED" }}>
        <Text format={{ fontName: fonts.interItalic }}>Points: </Text>
        <Text newLine>{stats.pointCount.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Feature #: </Text>
        <Text newLine>{stats.feature.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Bug #: </Text>
        <Text newLine>{stats.bug.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Chore #: </Text>
        <Text newLine>{stats.chore.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Release #: </Text>
        <Text>{stats.release.toLocaleString()}</Text>
      </Text>
    </Sticky>
  );
}
