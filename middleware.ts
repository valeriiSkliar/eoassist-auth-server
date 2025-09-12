import { NextPage } from "next";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { loger } from "./lib/console-loger";
import { generateApiKey } from "./lib/generate-api-key";
import { AppConfig } from "./utils/AppConfig";
import { getDomainZoneFromHeaders, setDomainInfoCookie } from "./lib/domain-zone";

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
    
    // Определяем доменную зону
    const domainInfo = getDomainZoneFromHeaders(request.headers, request.cookies);
    setDomainInfoCookie(response, domainInfo);
    
    // Устанавливаем глобальную переменную для доступа из любой точки приложения
    (globalThis as any).__DOMAIN_INFO = domainInfo;

    // Получаем заголовки от ru-proxy из основного middleware (уже установлены в cookies)
    const xOriginServer = request.headers.get('x-origin-server') || request.cookies.get('x-origin-server')?.value;
    const xProxyHost = request.headers.get('x-proxy-host') || request.cookies.get('x-proxy-host')?.value;
    
    // Получаем referer и originHost из параметров запроса
    const refererFromRequest = request.headers.get('referer') ?? '';
    const url = new URL(request.url);
    const originHost = url.searchParams.get('originHost');
    
    // Определяем источник запроса
    const sourceUrl = originHost || refererFromRequest;
    
    // Логируем для отладки в authMiddleware
    loger.info('[AUTH-MIDDLEWARE] Request processing', { 
      referer: refererFromRequest, 
      originHost, 
      sourceUrl,
      host: request.headers.get('host'),
      xOriginServer,
      xProxyHost,
      url: request.url,
      pathname: url.pathname,
      timestamp: new Date().toISOString()
    });

    // Обязательно сохраняем заголовки ru-proxy в cookies и headers для NextAuth callbacks
    if (xOriginServer) {
      request.cookies.set('x-origin-server', xOriginServer);
      response.cookies.set('x-origin-server', xOriginServer, { 
        httpOnly: false, // Делаем доступным для клиента
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      response.headers.set('x-origin-server', xOriginServer);
      
      // Устанавливаем глобальные переменные для NextAuth callbacks
      (globalThis as any).__NEXT_PRIVATE_ORIGIN_SERVER = xOriginServer;
      
      loger.info('[AUTH-MIDDLEWARE] X-ORIGIN-SERVER set', {
        xOriginServer,
        timestamp: new Date().toISOString()
      });
    }
    
    if (xProxyHost) {
      request.cookies.set('x-proxy-host', xProxyHost);
      response.cookies.set('x-proxy-host', xProxyHost, { 
        httpOnly: false, // Делаем доступным для клиента
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      response.headers.set('x-proxy-host', xProxyHost);
      
      // Устанавливаем глобальные переменные для NextAuth callbacks
      (globalThis as any).__NEXT_PRIVATE_PROXY_HOST = xProxyHost;
      
      loger.info('[AUTH-MIDDLEWARE] X-PROXY-HOST set', {
        xProxyHost,
        timestamp: new Date().toISOString()
      });
    }
    
    // Сохраняем информацию о домене-источнике
    if (sourceUrl) {
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
  
  // Определяем доменную зону на самом раннем этапе
  const domainInfo = getDomainZoneFromHeaders(req.headers, req.cookies);
  
  // Устанавливаем глобальную переменную для доступа из любой точки приложения
  (globalThis as any).__DOMAIN_INFO = domainInfo;

  
  const xOriginServer = req.headers.get('x-origin-server'),
        xProxyHost = req.headers.get('x-proxy-host');
        
  // Обрабатываем ru-proxy заголовки для всех запросов
  if (xOriginServer === 'ru-proxy') {
    req.cookies.set('x-origin-server', xOriginServer);
    req.cookies.set('x-proxy-host', xProxyHost || '');
    
    // Устанавливаем глобальные переменные для NextAuth callbacks
    (globalThis as any).__NEXT_PRIVATE_ORIGIN_SERVER = xOriginServer;
    (globalThis as any).__NEXT_PRIVATE_PROXY_HOST = xProxyHost;
    
    // Добавляем search параметр для NextAuth, если его еще нет
    if (!req.nextUrl.searchParams.has('ruProxy') && xProxyHost) {
      req.nextUrl.searchParams.set('ruProxy', 'true');
      req.nextUrl.searchParams.set('ruProxyHost', xProxyHost);
    }
    
    loger.info('[MIDDLEWARE ROOT] RU-PROXY headers processed', {
      xOriginServer,
      xProxyHost,
      pathname: req.nextUrl.pathname,
      hasRuProxyParam: req.nextUrl.searchParams.has('ruProxy'),
      timestamp: new Date().toISOString()
    });
  }

  const publicPathnameRegex = RegExp(
    `^(/(${AppConfig.locales.join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  loger.info('[MIDDLEWARE ROOT] Page routing decision', {
    pathname: req.nextUrl.pathname,
    isPublicPage,
    willUseAuthMiddleware: !isPublicPage,
    timestamp: new Date().toISOString()
  });

  if (isPublicPage) {
    const response = intlMiddleware(req);
    
    // Для публичных страниц тоже передаем domain info и ru-proxy заголовки в ответе
    if (response instanceof NextResponse) {
      // Устанавливаем domain info для публичных страниц
      setDomainInfoCookie(response, domainInfo);
      
      if (xOriginServer === 'ru-proxy') {
        response.cookies.set('x-origin-server', xOriginServer, { 
          httpOnly: false,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        response.cookies.set('x-proxy-host', xProxyHost || '', { 
          httpOnly: false,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        response.headers.set('x-origin-server', xOriginServer);
        response.headers.set('x-proxy-host', xProxyHost || '');
        
      }
    }
    
    return response;
  } else {
    // @ts-ignore
    return (authMiddleware)(req, event);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}