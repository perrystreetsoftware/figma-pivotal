const separation = 20;

const { figJamBaseLight, figJamBase } = figma.constants.colors;

function createSectionFromFrame<T extends SceneNode>(frame: FrameNode, color: string, callback: ((child: T) => SceneNode) | undefined = undefined) : SectionNode {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";

  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x;
  section.y = frame.y;
  section.resizeWithoutConstraints(frame.width, frame.height);
  section.fills = [figma.util.solidPaint(color)];

  (frame.children as T[]).forEach(child => section.appendChild(callback ? callback(child) : child));
  frame.remove();

  return section;
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
  createSectionFromFrame<FrameNode>(parentFrame, figJamBaseLight.lightGray, monthFrame =>
    createSectionFromFrame<FrameNode>(monthFrame, figJamBaseLight.lightViolet, weekFrame =>
      createSectionFromFrame<StickyNode>(weekFrame, figJamBase.violet)
    )
  );
}
