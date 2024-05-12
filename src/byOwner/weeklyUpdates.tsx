import { SectionFrame } from "../components/frame";
import { Sticky, Text } from "../components/sticky";
import { fonts } from "../fonts";

type WeekUpdateProps = {
  month: string;
};

const { figJamBaseLight } = figma.constants.colors;

export default function WeeklyUpdates({ month }: WeekUpdateProps) {
  return (
    <SectionFrame layoutMode="VERTICAL" separationMultiple={2} name="Weekly Updates" noSection>
      <Sticky fill={figJamBaseLight.lightGray}>
        <Text format={{ fontName: fonts.interBold }} newLine>Weekly Update for {month} 1</Text>
      </Sticky>

      <Sticky fill={figJamBaseLight.lightGray}>
        <Text format={{ fontName: fonts.interBold }} newLine>Weekly Update for {month} 2</Text>
      </Sticky>
    </SectionFrame>
  );
}
