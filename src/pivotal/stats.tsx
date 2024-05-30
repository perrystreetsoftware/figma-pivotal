import { Sticky, Text, Br } from "../components/sticky";
import { fonts } from "../fonts";
import { dateFormat } from "../date";

type PivotalStatsProps = {
  storiesAndCommits: DataByMonthWeek,
  epic?: PivotalEpic,
};

const { figJamBaseLight } = figma.constants.colors;

function calculateStats(storiesAndCommits: DataByMonthWeek) {
  const stats = {
    pointCount: 0,
    feature: 0,
    bug: 0,
    chore: 0,
    release: 0,
  };

  for (const month of Object.values(storiesAndCommits)) {
    for (const { stories } of Object.values(month)) {
      for (const story of stories) {
        if (story.estimate) stats.pointCount += story.estimate;
        stats[story.story_type]++;
      }
    }
  }

  return stats;
}

export default function PivotalStats({ storiesAndCommits, epic }: PivotalStatsProps): StickyNode {
  const stats = calculateStats(storiesAndCommits);
  return (
    <Sticky fill={figJamBaseLight.lightGreen}>
      { epic ? (
        <Text format={{ fontName: fonts.interBold, fontSize: 28, url: epic.url }} newLine>{epic.name}</Text>
      ) : (
        <Text format={{ fontName: fonts.interBold, fontSize: 28 }} newLine>Pivotal Stats</Text>
      )}
      <Br />
      <Text format={{ listType: "UNORDERED" }}>
        <Text format={{ fontName: fonts.interBold }}>Points: </Text>
        <Text newLine>{stats.pointCount.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interBold }}>Feature #: </Text>
        <Text newLine>{stats.feature.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interBold }}>Bug #: </Text>
        <Text newLine>{stats.bug.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interBold }}>Chore #: </Text>
        <Text newLine>{stats.chore.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interBold }}>Release #: </Text>
        <Text newLine>{stats.release.toLocaleString()}</Text>
        {epic && (<Text format={{ fontName: fonts.interBold }}>Projected Completion: </Text>)}
        {epic && (<Text>{dateFormat(new Date(epic.completed_at!))}</Text>)}
      </Text>
    </Sticky>
  );
}
