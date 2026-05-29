import {
  DEVELOPER_ENTITY,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
} from '../../constants/legal';
import { getAppDisplayName } from '../i18n/format';
import { getStringsForLocale } from '../i18n/strings';
import type { Locale } from '../i18n/types';

export type PrivacySection = {
  title: string;
  paragraphs: readonly string[];
};

export type PrivacyPolicyMeta = {
  title: string;
  appName: string;
  developer: string;
  lastUpdated: string;
  publicUrl: string;
  supportUrl: string;
};

export function getPrivacyPolicyMeta(locale: Locale): PrivacyPolicyMeta {
  const strings = getStringsForLocale(locale);
  return {
    title: strings.privacy.title,
    appName: getAppDisplayName(locale),
    developer: DEVELOPER_ENTITY,
    lastUpdated: PRIVACY_POLICY_LAST_UPDATED,
    publicUrl: PRIVACY_POLICY_URL,
    supportUrl: SUPPORT_URL,
  };
}

export function getPrivacyPolicySections(locale: Locale): PrivacySection[] {
  return getStringsForLocale(locale).privacy.sections.map((section) => ({
    title: section.title,
    paragraphs: section.paragraphs,
  }));
}

/** @deprecated Prefer getPrivacyPolicyMeta(locale) */
export const privacyPolicyMeta = getPrivacyPolicyMeta('zh');

/** @deprecated Prefer getPrivacyPolicySections(locale) */
export const privacyPolicySections = getPrivacyPolicySections('zh');
