// next-intl.config.ts

import { getRequestConfig } from 'next-intl/server';

import { AppConfig } from './utils/AppConfig';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./locales/${locale}.json`)).default,
  locales: AppConfig.locales,
  defaultLocale: AppConfig.defaultLocale,
}));
