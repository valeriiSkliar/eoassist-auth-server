import { NextPage } from "next";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { loger } from "./lib/console-loger";
import { generateApiKey } from "./lib/generate-api-key";
import { AppConfig } from "./utils/AppConfig";

export function getSubdomain(url: string): string  {
  if (!url) {
    return '';
  }
  const urlObject = new URL(url);
  const hostnameParts = urlObject.hostname.split('.');

  // Check for at least two parts (subdomain and domain)
  if (hostnameParts.length < 2) {
    return '';
  }

  // The subdomain is the part before the top-level domain
  return hostnameParts?.[0] ?? '';
}
let publicPages = ['/','sites/*','about',]



// const baseMiddleware: CustomMiddleware = async (request, event, response) => {
//   request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
//   return response;
// };

// export default chain([
//   withCorsMiddleware,
//   withReferralMiddleware,
//   withAuthMiddleware,
//   withI18nMiddleware,
//   baseMiddleware
// ]);

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

 const  authMiddleware = auth(
  async (request) => {
    request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
    const response = NextResponse.next()
    
    // Получаем referer и originHost из параметров запроса
    const refererFromRequest = request.headers.get('referer') ?? '';
    const url = new URL(request.url);
    const originHost = url.searchParams.get('originHost');
    
    // Определяем источник запроса
    const sourceUrl = originHost || refererFromRequest;
    
    // Логируем для отладки
    loger.info('Middleware processing', { 
      referer: refererFromRequest, 
      originHost, 
      sourceUrl,
      host: request.headers.get('host')
    });

    // Сохраняем информацию о домене-источнике
    if (sourceUrl) {
      const subdomain = getSubdomain(sourceUrl);
      request.headers.set('referal-domain', sourceUrl);
      request.cookies.set('referal-domain', sourceUrl);
      response.cookies.set('referal-domain', sourceUrl);
      response.headers.set('referal-domain', sourceUrl);
      
      // Если есть originHost, сохраняем его отдельно
      if (originHost) {
        response.cookies.set('origin-host', originHost);
      }
    }

    // Настраиваем CORS для поддержки всех разрешенных доменов
    const allowedOrigins = [
      'https://eoassist.com',
      'https://*.eoassist.com',
      'https://eoassist.ru', 
      'https://*.eoassist.ru',
      'https://eoassist.store',
      'https://*.eoassist.store'
    ];
    
    const origin = request.headers.get('origin');
    if (origin) {
      // Проверяем, соответствует ли origin разрешенным доменам
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace('*', '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin;
      });
      
      if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    } else {
      // Если origin не указан, разрешаем для всех (для разработки)
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        headers: response.headers,
        status: 204,
      });
    }

    return response;
  }
)

export default function middleware( req: NextRequest, event: NextPage) {
  const publicPathnameRegex = RegExp(
    `^(/(${AppConfig.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // @ts-ignore
    return (authMiddleware)(req, event);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}