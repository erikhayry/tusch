import { describe, expect, it } from "vitest";
import { renderRelativeHeading } from "./utils/renderRelativeHeading";

describe('Relative Heading', () => {
  it('should render h1', () => {
    const { getHeadingLevel1 } = renderRelativeHeading();

    expect(getHeadingLevel1()).toBeInTheDocument();
  });

  it('should render h2', () => {
    const { getHeadingLevel2 } = renderRelativeHeading();

    expect(getHeadingLevel2()).toBeInTheDocument();
  });

  it('should render sibling as h2', () => {
    const { getHeadingLevel2Sibling } = renderRelativeHeading();

    expect(getHeadingLevel2Sibling()).toBeInTheDocument();
  });

  it('should render h3', () => {
    const { getHeadingLevel3 } = renderRelativeHeading();

    expect(getHeadingLevel3()).toBeInTheDocument();
  });

  it('should render h4', () => {
    const { getHeadingLevel4 } = renderRelativeHeading();

    expect(getHeadingLevel4()).toBeInTheDocument();
  });

  it('should render h5', () => {
    const { getHeadingLevel5 } = renderRelativeHeading();

    expect(getHeadingLevel5()).toBeInTheDocument();
  });

  it('should render h6', () => {
    const { getHeadingLevel6 } = renderRelativeHeading();

    expect(getHeadingLevel6()).toBeInTheDocument();
  });

  it('should render max level', () => {
    const { getHeadingLevelMax } = renderRelativeHeading();

    expect(getHeadingLevelMax()).toBeInTheDocument();
  });
});
