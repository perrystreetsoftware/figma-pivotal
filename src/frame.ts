const separation = 20;

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function createSectionFromFrame(frame: FrameNode, color: string): SectionNode {
  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x;
  section.y = frame.y;
  section.resizeWithoutConstraints(frame.width, frame.height);
  section.fills = [figma.util.solidPaint(color)];
  return section;
}

function* iterateChildrenAndRemoveFrame<ChildType extends SceneNode>(frame: FrameNode): Generator<ChildType, void, undefined> {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";
  yield* frame.children as ChildType[];
  frame.remove();
}

export function createFrame(layoutMode: AutoLayoutMixin["layoutMode"], separationMultiple: number, name: string): FrameNode {
  const separationWithMultiplier = separation * separationMultiple;
  const frame = figma.createFrame();
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = frame.counterAxisSpacing = frame.paddingBottom = frame.paddingTop = frame.paddingLeft = frame.paddingRight = separationWithMultiplier;
  frame.name = name
  return frame;
}

export function transferStickiesToSections(parentFrame: FrameNode) {
  const parentSection = createSectionFromFrame(parentFrame, figJamBaseLight.lightGray);

  for (const monthFrame of iterateChildrenAndRemoveFrame<FrameNode>(parentFrame)) {
    const monthSection = createSectionFromFrame(monthFrame, figJamBaseLight.lightViolet);
    parentSection.appendChild(monthSection);

    for (const weekFrame of iterateChildrenAndRemoveFrame<FrameNode>(monthFrame)) {
      const weekSection = createSectionFromFrame(weekFrame, figJamBase.violet);
      monthSection.appendChild(weekSection);

      for (const storiesOrCommitsFrame of iterateChildrenAndRemoveFrame<FrameNode>(weekFrame)) {

        for (const sticky of iterateChildrenAndRemoveFrame<StickyNode>(storiesOrCommitsFrame)) {
          sticky.x += storiesOrCommitsFrame.x;
          sticky.y += storiesOrCommitsFrame.y;
          weekSection.appendChild(sticky);
        }
      }
    }
  }
}
