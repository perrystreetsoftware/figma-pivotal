import { Sticky, Text, Br } from "../components/sticky";
import { fonts } from "../fonts";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function calculateStats(storiesAndCommits: ByMonthWeek) {
  const stats = {
    soloCommits: 0,
    pairCommits: 0,
    additions: 0,
    deletions: 0,
    changedFilesIfAvailable: 0
  };

  Object.values(storiesAndCommits).forEach(month => {
    Object.values(month).forEach(week => {
      week.commits.forEach(commit => {
        commit.authors.author.length > 1 ? stats.pairCommits++ : stats.soloCommits++;
        stats.additions += commit.additions;
        stats.deletions += commit.deletions;
        stats.changedFilesIfAvailable += commit.changedFilesIfAvailable;
      });
    });
  });

  return stats;
}

export default function GithubStats({storiesAndCommits}: {storiesAndCommits: ByMonthWeek}): StickyNode {
  const stats = calculateStats(storiesAndCommits)
  return (
    <Sticky fill={figJamBaseLight.lightGreen}>
      <Text format={{ fontName: fonts.interBold, fontSize: 28 }} newLine>Github Stats</Text>
      <Br />
      <Text format={{ listType: "UNORDERED" }}>
        <Text format={{ fontName: fonts.interItalic }}>Solo Commits: </Text>
        <Text newLine>{stats.soloCommits.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Pair Commits: </Text>
        <Text newLine>{stats.pairCommits.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Additions: </Text>
        <Text newLine>{stats.additions.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Deletions: </Text>
        <Text newLine>{stats.deletions.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Changed Files: </Text>
        <Text>{stats.changedFilesIfAvailable.toLocaleString()}</Text>
      </Text>
    </Sticky>
  );
}
