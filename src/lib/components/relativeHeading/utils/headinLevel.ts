import { getContext, setContext } from "svelte";

const headingLevelContext = 'headingLevel';

function getLevel() {
  return getContext<number>(headingLevelContext) ?? 1;
}

export function getTag() {
  return `h${Math.min(getLevel(), 6)}`;
}

function getCurrentDepth() {
  return Math.min(getLevel(), 6);
}

export function setLevel() {
  setContext(headingLevelContext, getCurrentDepth() + 1);
}
