// import type { LocalePrefix } from 'node_modules/next-intl/dist/types/src/routing/types';
import type { LocalePrefix } from '../node_modules/next-intl/dist/types/src/routing/types';

import localeConfig from './generated/locale-config.json';


const localePrefix: LocalePrefix = 'never';

// export const AppConfig = {
//   name: 'EOAssist',
//   locales: ['en', 'ru'],
//   defaultLocale: 'en',
//   localePrefix,
// };generate-locale-config
// import localeConfig from '../generated/locale-config.json';

export const AppConfig = {
  name: 'EOAssist',
  locales: localeConfig.locales,
  defaultLocale: localeConfig.defaultLocale,
  localePrefix,
};
