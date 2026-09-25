import { render } from "@testing-library/svelte";
import RelativeHeadinTestWrapper, { headingLevel1, headingLevel2, headingLevel2Sibling, headingLevel3, headingLevel4, headingLevel5, headingLevel6, headingLevelMax } from "./RelativeHeadinTestWrapper.svelte";

export function renderRelativeHeading() {
  const { getByRole } = render(RelativeHeadinTestWrapper);

  return {
    getHeadingLevel1: () => getByRole("heading", { name: headingLevel1, level: 1 }),
    getHeadingLevel2: () => getByRole("heading", { name: headingLevel2, level: 2 }),
    getHeadingLevel2Sibling: () => getByRole("heading", { name: headingLevel2Sibling, level: 2 }),
    getHeadingLevel3: () => getByRole("heading", { name: headingLevel3, level: 3 }),
    getHeadingLevel4: () => getByRole("heading", { name: headingLevel4, level: 4 }),
    getHeadingLevel5: () => getByRole("heading", { name: headingLevel5, level: 5 }),
    getHeadingLevel6: () => getByRole("heading", { name: headingLevel6, level: 6 }),
    getHeadingLevelMax: () => getByRole("heading", { name: headingLevelMax, level: 6 }),
  };
}
