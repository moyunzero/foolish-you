import * as copy from './copy';
import { patterns } from './patterns';
import { privacy } from './privacy';
import { ui } from './ui';

/** English UI strings. */
export const strings = {
  app: {
    name: 'Brainfool',
    tagline: 'One puzzle a day',
  },
  meta: {
    today: 'Today',
  },
  ui,
  patterns,
  copy,
  privacy,
} as const;
