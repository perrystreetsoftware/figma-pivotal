const stickySeparation = 20;

function createSectionFromFrame(frame: FrameNode) {
  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x - stickySeparation;
  section.y = frame.y - stickySeparation;
  section.resizeWithoutConstraints(frame.width + (stickySeparation * 2), frame.height + (stickySeparation * 2));
  section.fills = [figma.util.solidPaint(figma.constants.colors.figJamBaseLight.lightViolet)];
  return section;
}

export function createFrame(layoutMode: AutoLayoutMixin["layoutMode"]): FrameNode {
  const frame = figma.createFrame();
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = layoutMode == "HORIZONTAL" ? (stickySeparation * 4) : stickySeparation;
  return frame;
}

export function transferStickiesToSections(parentFrame: FrameNode) {
  parentFrame.resizeWithoutConstraints(parentFrame.width, parentFrame.height);
  parentFrame.layoutMode = "NONE";

  (parentFrame.children as FrameNode[]).forEach((weekFrame) => {
    weekFrame.layoutMode = "NONE";
    const weekSection = createSectionFromFrame(weekFrame);
    weekFrame.children.forEach((sticky) => {
      weekSection.appendChild(sticky);
      sticky.x += stickySeparation;
      sticky.y += stickySeparation;
    });
    weekFrame.remove();
  });

  parentFrame.remove();
}