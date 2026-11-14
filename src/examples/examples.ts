import { EXAMPLE_COMPLETE } from './example-complete';
import { EXAMPLE_MINIMAL } from './example-minimal';
import { EXAMPLE_NO_IMAGES } from './example-no-images';

// Order matters: tests read the examples by index (src/tests/e2e/examples.ts).
export const EXAMPLES = [EXAMPLE_COMPLETE, EXAMPLE_NO_IMAGES, EXAMPLE_MINIMAL];
