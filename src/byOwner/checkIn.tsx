import { SectionFrame } from "../components/frame";
import { Sticky, Text } from "../components/sticky";
import { fonts } from "../fonts";

const { figJamBaseLight, figJamBase } = figma.constants.colors;

type HighlightStickiesProps = {
  name: string,
  color: string
};

interface HighLightOrImprovementSectionProps extends HighlightStickiesProps {
  Component: typeof HighlightSection | typeof ImprovementSection
}

type HighlightProps = {
  title: string,
  description: string,
  color: string
};

const lightColor = (string: string): string => figJamBaseLight[`light${string.charAt(0).toUpperCase()}${string.slice(1)}`];

function Highlight({ title, description, color }: HighlightProps) {
  return (
    <Sticky fill={color}>
      <Text format={{ fontName: fonts.interBold }} newLine>{title}</Text>
      <Text format={{ listType: "UNORDERED" }}>{description}</Text>
    </Sticky>
  );
}

function HighlightSection({name, color}: HighlightStickiesProps) {
  return (
    <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name={name} noSection>
      <Highlight title="Situation" description="Background & Context" color={color} />
      <Highlight title="Tasks" description="What you did" color={color} />
      <Highlight title="Action" description="The Evidence" color={color} />
      <Highlight title="Result" description="Technical, Personal, Team, and PSS Outcomes" color={color} />
    </SectionFrame>
  )
}

function ImprovementSection({name, color}: HighlightStickiesProps) {
  return (
    <SectionFrame layoutMode="VERTICAL" separationMultiple={1} name={name} noSection>
      <Highlight title="Situation" description="Background & Context" color={color} />
      <Highlight title="Measurable" description="How do you measure the success of this improvement" color={color} />
      <Highlight title="Actions" description="The set of actions you will do to complete it" color={color} />
      <Highlight title="Relevance" description="Approved by Manager" color={color} />
      <Highlight title="Time" description="By when will this be completed" color={color} />
    </SectionFrame>
  );
}

function HighLightOrImprovementSection({name, color, Component }: HighLightOrImprovementSectionProps ) {
  const stickyColor = lightColor(color);
  return (
    <SectionFrame layoutMode="HORIZONTAL" separationMultiple={2} name={name} color={figJamBase[color]}>
      <Component name="Highlight 1" color={stickyColor} />
      <Component name="Highlight 2" color={stickyColor} />
      <Component name="Highlight 3" color={stickyColor} />
    </SectionFrame>
  );
}

export default function CheckIn() {
  return (
    <SectionFrame layoutMode="HORIZONTAL" separationMultiple={3} name="Highlights" noSection>
      <HighLightOrImprovementSection name="Architecture" color="yellow" Component={HighlightSection} />
      <HighLightOrImprovementSection name="Team Lead" color="green" Component={HighlightSection} />
      <HighLightOrImprovementSection name="Engineering Manager" color="blue" Component={HighlightSection} />
      <HighLightOrImprovementSection name="Other" color="orange" Component={HighlightSection} />
      <HighLightOrImprovementSection name="Improvements" color="violet" Component={ImprovementSection} />
    </SectionFrame>
  );
}
