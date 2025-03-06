// middlewares/withI18nMiddleware.ts
import { AppConfig } from '@/utils/AppConfig';
import createMiddleware from 'next-intl/middleware';
import { CustomMiddleware } from './chain';

const handleI18nRouting = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

export function withI18nMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    await handleI18nRouting(request);
    return middleware(request, event, response);
  };
}