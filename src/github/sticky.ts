import Sticky from "../sticky";

export default function pivotalSticky(story: GithubPr): StickyNode {
  const sticky = new Sticky();
  
  return sticky.getNode();
}
