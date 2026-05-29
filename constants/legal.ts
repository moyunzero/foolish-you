/** 应用商店与隐私政策页共用的法律/联系信息 */

import type { Locale } from '../lib/i18n/types';
import { getAppDisplayName } from '../lib/i18n/format';

/** @deprecated Prefer getLegalAppDisplayName(locale) or getAppDisplayName from lib/i18n/format */
export const APP_DISPLAY_NAME = '傻了么';

export function getLegalAppDisplayName(locale: Locale = 'zh'): string {
  return getAppDisplayName(locale);
}

/** 开发者实体（App Store / Google Play 填写的名称） */
export const DEVELOPER_ENTITY = 'mo yun';

export const SUPPORT_URL =
  'https://github.com/moyunzero/foolish-you/issues';

/**
 * 公开隐私政策 URL（GitHub Pages：`docs/` 目录）。
 * 在仓库 Settings → Pages → Source: Deploy from branch → /docs 后生效。
 */
export const PRIVACY_POLICY_URL =
  'https://moyunzero.github.io/foolish-you/privacy.html';

export const PRIVACY_POLICY_LAST_UPDATED = '2026-05-17';
