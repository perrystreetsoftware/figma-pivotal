import { Sticky, Text, Br } from "../components/sticky";
import { fonts } from "../fonts";

const { figJamBase } = figma.constants.colors;

function toSentence(parts: string[]): string {
  if (parts.length == 2) return parts.join(' and ');
  return parts.join(', ').replace(/,\s([^,]+)$/, ', and $1');
}

const repositoryEmoji: Record<string, string> = {
  Husband: "🍎",
  "Husband-Droid": "🤖",
  "Husband-Redis": "🖥️",
};

export default function GithubSticky({commit}: {commit: GithubCommit}): StickyNode {
  return (
    <Sticky fill={figJamBase.white}>
      <Text>{repositoryEmoji[commit.repository.name] || "💾"} </Text>
      <Text format={{ fontName: fonts.interBold, url: commit.commitUrl }} newLine>{commit.messageHeadline}</Text>
      <Br />
      <Text format={{ listType: "UNORDERED" }}>
        <Text format={{ fontName: fonts.interItalic }}>Authors: </Text>
        <Text newLine>{toSentence(commit.authors.author.map(({ name }) => name))}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Repository: </Text>
        <Text newLine>{commit.repository.name}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Additions: </Text>
        <Text newLine>{commit.additions.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Deletions: </Text>
        <Text newLine>{commit.deletions.toLocaleString()}</Text>
        <Text format={{ fontName: fonts.interItalic }}>Changed Files: </Text>
        <Text>{commit.changedFilesIfAvailable.toLocaleString()}</Text>
      </Text>
    </Sticky>
  );
}