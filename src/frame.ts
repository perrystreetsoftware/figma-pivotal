const separation = 20;

const { figJamBaseLight, figJamBase } = figma.constants.colors;

type SectionFrameProps = {
  children: FigmaDeclarativeChildren<FrameNode>,
  layoutMode: AutoLayoutMixin["layoutMode"],
  name: string,
  separationMultiple: number,
  color?: string,
  group?: boolean
};

export function Frame({children, layoutMode, name, separationMultiple, color, group}: SectionFrameProps): FrameNode {
  const separationWithMultiplier = separation * separationMultiple;
  const frame = figma.createFrame();
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = frame.counterAxisSpacing = frame.paddingBottom = frame.paddingTop = frame.paddingLeft = frame.paddingRight = separationWithMultiplier;
  frame.name = name
  if (color) frame.fills = [figma.util.solidPaint(color)];

  if (Array.isArray(children)) {
    children.flat().forEach(child => frame.appendChild(child));
  }

  if (group) frame.setPluginData("group", "true");

  return frame;
}

export function FrameToSection({children}: {children: FrameNode[]}) {
  const frame = children[0] as FrameNode;
  const section = createSectionFromFrame(frame);
  walkNodeTree(frame, section);
}

function isAFrameNode(node: SceneNode): node is FrameNode {
  return node.type === "FRAME";
}

function isAStickyNode(node: SceneNode): node is StickyNode {
  return node.type === "STICKY";
}

function walkNodeTree(frame: FrameNode, section: SectionNode) {
  for (const child of iterateChildrenAndRemoveFrame(frame)) {
    if (isAFrameNode(child)) {
      if (child.getPluginData("group") === "true") {
        section.appendChild(child);
        walkNodeTree(child, section);
      } else {
        const childSection = createSectionFromFrame(child);
        section.appendChild(childSection);
        walkNodeTree(child, childSection);
      }
    } else if (isAStickyNode(child)) {
      child.x += frame.x;
      child.y += frame.y;
      section.appendChild(child);
    }
  }
}

function* iterateChildrenAndRemoveFrame<ChildType extends SceneNode>(frame: FrameNode): Generator<ChildType, void, undefined> {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";
  yield* frame.children as ChildType[];
  frame.remove();
}

function createSectionFromFrame(frame: FrameNode): SectionNode {
  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x;
  section.y = frame.y;
  section.resizeWithoutConstraints(frame.width, frame.height);
  section.fills = frame.fills;
  return section;
}
