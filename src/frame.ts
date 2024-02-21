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

function moveChildrenFromFrameToSection<T extends SceneNode>(frame: FrameNode, callback: (scene: T) => void) {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";

  (frame.children as T[]).forEach(callback);

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
  const parentSection = createSectionFromFrame(parentFrame, figJamBaseLight.lightGray);

  moveChildrenFromFrameToSection<FrameNode>(parentFrame, (monthFrame) => {
    const monthSection = createSectionFromFrame(monthFrame, figJamBaseLight.lightViolet);
    parentSection.appendChild(monthSection);

    moveChildrenFromFrameToSection<FrameNode>(monthFrame, (weekFrame) => {
      const weekSection = createSectionFromFrame(weekFrame, figJamBase.violet);
      monthSection.appendChild(weekSection);

      moveChildrenFromFrameToSection<FrameNode>(weekFrame, (storiesOrCommitsFrame) => {
        moveChildrenFromFrameToSection<StickyNode>(storiesOrCommitsFrame, sticky => {
          sticky.x += storiesOrCommitsFrame.x;
          sticky.y += storiesOrCommitsFrame.y;
          weekSection.appendChild(sticky)
        });
      });
    });
  });
}
