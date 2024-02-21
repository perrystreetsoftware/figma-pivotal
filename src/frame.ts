const separation = 20;

const { figJamBaseLight, figJamBase } = figma.constants.colors;

type A = (node: FrameNode) => SceneNode;
type B = (node: FrameNode, section: SectionNode) => void;

function createSectionFromFrame(frame: FrameNode, color: string, callbackA?: A, callbackB?: B): SectionNode {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";

  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x;
  section.y = frame.y;
  section.resizeWithoutConstraints(frame.width, frame.height);
  section.fills = [figma.util.solidPaint(color)];

  (frame.children as FrameNode[]).forEach(child => callbackA ? section.appendChild(callbackA(child)) : callbackB!(child, section));

  frame.remove();

  return section;
}

function removeStickies(frame: FrameNode, section: SectionNode) {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";

  (frame.children as StickyNode[]).forEach(sticky => {
    sticky.x += frame.x;
    sticky.y += frame.y;
    section.appendChild(sticky)
  });

  frame.remove();
}

export function createFrame(layoutMode: AutoLayoutMixin["layoutMode"], separationMultiple: number): FrameNode {
  const sep = separation * separationMultiple;
  const frame = figma.createFrame();
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = sep;
  frame.counterAxisSpacing = sep;
  frame.paddingBottom = sep;
  frame.paddingTop = sep;
  frame.paddingLeft = sep;
  frame.paddingRight = sep;
  return frame;
}

export function transferStickiesToSections(parentFrame: FrameNode) {
  createSectionFromFrame(parentFrame, figJamBaseLight.lightGray, (monthFrame) =>
    createSectionFromFrame(monthFrame, figJamBaseLight.lightViolet, (weekFrame) =>
      createSectionFromFrame(weekFrame, figJamBase.violet, undefined, (storyOrCommitFrame, section) => 
        removeStickies(storyOrCommitFrame, section)
      )
    )
  )
}
