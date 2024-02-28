const separation = 20;

type SectionFrameProps = {
  children: FigmaDeclarativeChildren<FrameNode>,
  layoutMode: AutoLayoutMixin["layoutMode"],
  name: string,
  separationMultiple: number,
  color?: string,
  noSection?: boolean
};

const isFrameNode = (node: SceneNode): node is FrameNode => node.type === "FRAME";
const isStickyNode = (node: SceneNode): node is StickyNode => node.type === "STICKY";
const isSceneNode = (node: unknown): node is SceneNode => typeof node === "object" && !!node!.type;

function walkNodeTree(frame: FrameNode, section: SectionNode) {
  for (const child of iterateChildrenAndRemoveFrame(frame)) {
    if (isFrameNode(child)) {
      const childSection = createSectionFromFrame(child);
      section.appendChild(childSection);
      walkNodeTree(child, childSection);
    } else if (isStickyNode(child)) {
      section.appendChild(child);
    }
  }
}

function* iterateChildrenAndRemoveFrame(frame: FrameNode): Generator<SceneNode, void, undefined> {
  frame.resizeWithoutConstraints(frame.width, frame.height);
  frame.layoutMode = "NONE";
  yield* frame.children;
  frame.remove();
}

function createSectionFromFrame(frame: FrameNode): SectionNode {
  const section = figma.createSection();
  section.name = frame.name;
  section.x = frame.x;
  section.y = frame.y;
  section.resizeWithoutConstraints(frame.width, frame.height);
  section.fills = frame.fills;
  if (frame.getPluginData("noSection") === "true") section.setPluginData("noSection", "true");
  return section;
}

export function SectionFrame({children, layoutMode, name, separationMultiple, color, noSection}: SectionFrameProps): FrameNode {
  const frame = figma.createFrame();
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = frame.counterAxisSpacing = frame.paddingBottom = frame.paddingTop = frame.paddingLeft = frame.paddingRight = separation * separationMultiple;
  frame.name = name;
  if (noSection) frame.setPluginData("noSection", "true");
  if (color) frame.fills = [figma.util.solidPaint(color)];

  if (Array.isArray(children)) {
    for (const child of children.flat()) {
      if (isSceneNode(child)) {
        frame.appendChild(child);
      }
    }
  }

  return frame;
}

export function FrameToSection({children}: {children: FrameNode[]}) {
  const frame = children[0] as FrameNode;
  const section = createSectionFromFrame(frame);
  walkNodeTree(frame, section);
  section.findAllWithCriteria({types: ["SECTION"], pluginData: {keys: ["noSection"]}}).forEach(figma.ungroup);
}
