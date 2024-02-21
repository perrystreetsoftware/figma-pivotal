import Sticky from "../sticky";
import { fonts } from "../fonts";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function toSentence(parts: string[]): string {
  if (parts.length == 2) return parts.join(' and ');
  return parts.join(', ').replace(/,\s([^,]+)$/, ', and $1');
}

function list(sticky: Sticky, title: string, value: string) {
  sticky.text("\n")
  sticky.textWithFormatting(() => {
    sticky.textWithFormatting(title, {fontName: fonts.interItalic});
    sticky.text(`: ${value}`);
  }, {listType: "UNORDERED"});
}

export default function githubSticky(commit: GithubCommit): StickyNode {
  const sticky = new Sticky();

  sticky.textWithFormatting(commit.messageHeadline, {fontName: fonts.interBold, url: commit.commitUrl});
  sticky.text("\n")

  list(sticky, "Authors", toSentence(commit.authors.author.map(({name}) => name)));
  list(sticky, "Repository", commit.repository.name);
  list(sticky, "Additions", commit.additions.toLocaleString());
  list(sticky, "Deletions", commit.deletions.toLocaleString());
  list(sticky, "Changed Files", commit.changedFilesIfAvailable.toLocaleString());

  sticky.fill(figJamBase.white);
  sticky.setPluginData("githubCommit", JSON.stringify(commit));
  sticky.authorVisible(false);
  
  return sticky.getNode();
}
