import * as copy from './copy';
import { notifications } from './notifications';
import { patterns } from './patterns';
import { privacy } from './privacy';
import { ui } from './ui';

/** Chinese UI strings. */
export const strings = {
  app: {
    name: '傻了么',
    tagline: '今日一题',
  },
  meta: {
    today: '今日',
  },
  ui,
  patterns,
  copy,
  privacy,
  notifications,
} as const;
