import type { strings as zhStrings } from '../../locales/zh';

/** Supported UI locales (v1.2: zh + en only). */
export type Locale = 'zh' | 'en';

/** Store-facing app name per locale. */
export type AppDisplayName = '傻了么' | 'Silly Me';

type DeepString<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => DeepString<R>
  : T extends string
    ? string
    : T extends readonly (infer U)[]
      ? readonly DeepString<U>[]
      : T extends object
        ? { readonly [K in keyof T]: DeepString<T[K]> }
        : T;

/** Locale string bundle shape (Plan 02 extends copy/ui/privacy). */
export type Strings = DeepString<typeof zhStrings>;
