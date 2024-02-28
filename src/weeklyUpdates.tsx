import format from "date-fns/lightFormat";

import { SectionFrame } from "./components/frame";
import { Sticky, Text } from "./components/sticky";
import { fonts } from "./fonts";

const { figJamBaseLight } = figma.constants.colors;

type WeekUpdateProps = {
  month: string;
};

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
