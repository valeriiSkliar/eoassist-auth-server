export type DomainZone = 'com' | 'ru' | 'store' | 'unknown';

export interface DomainInfo {
  zone: DomainZone;
  fullDomain: string;
  subdomain: string;
  baseDomain: string;
}

export function detectDomainZone(urlString: string): DomainInfo {
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    const hostname = url.hostname.toLowerCase();
    const parts = hostname.split('.');
    
    // Определяем доменную зону
    let zone: DomainZone = 'unknown';
    let baseDomain = '';
    let subdomain = '';
    
    // Проверяем известные доменные зоны
    if (hostname.includes('eoassist.com') || hostname.endsWith('.com')) {
      zone = 'com';
      baseDomain = 'eoassist.com';
    } else if (hostname.includes('eoassist.ru') || hostname.endsWith('.ru')) {
      zone = 'ru';
      baseDomain = 'eoassist.ru';
    } else if (hostname.includes('eoassist.store') || hostname.endsWith('.store')) {
      zone = 'store';
      baseDomain = 'eoassist.store';
    }
    
    // Определяем поддомен
    if (parts.length > 2) {
      // Убираем базовый домен и получаем поддомен
      const subdomainParts = parts.slice(0, -2);
      subdomain = subdomainParts.join('.');
    }
    
    return {
      zone,
      fullDomain: hostname,
      subdomain,
      baseDomain
    };
  } catch (error) {
    // В случае ошибки возвращаем unknown
    return {
      zone: 'unknown',
      fullDomain: urlString,
      subdomain: '',
      baseDomain: ''
    };
  }
}

export function getDomainZoneFromHeaders(
  headers: Headers,
  cookies?: any
): DomainInfo {
  // Приоритет определения источника:
  // 1. x-proxy-host (для ru-proxy)
  // 2. x-origin-server + host
  // 3. origin header
  // 4. referer header
  // 5. host header
  
  const xProxyHost = headers.get('x-proxy-host') || cookies?.get('x-proxy-host')?.value;
  const xOriginServer = headers.get('x-origin-server') || cookies?.get('x-origin-server')?.value;
  const origin = headers.get('origin');
  const referer = headers.get('referer');
  const host = headers.get('host');
  
  // Если есть x-proxy-host (ru-proxy), используем его
  if (xProxyHost) {
    return detectDomainZone(xProxyHost);
  }
  
  // Если есть origin, используем его
  if (origin) {
    return detectDomainZone(origin);
  }
  
  // Если есть referer, используем его
  if (referer) {
    return detectDomainZone(referer);
  }
  
  // Используем host как последний вариант
  if (host) {
    return detectDomainZone(host);
  }
  
  // Если ничего не найдено
  return {
    zone: 'unknown',
    fullDomain: '',
    subdomain: '',
    baseDomain: ''
  };
}

// Хелпер для установки domain info в cookies
export function setDomainInfoCookie(response: Response, domainInfo: DomainInfo): void {
  const domainInfoString = JSON.stringify(domainInfo);
  
  // Устанавливаем в заголовки ответа
  response.headers.set('x-domain-info', domainInfoString);
  
  // Если response поддерживает cookies (NextResponse)
  if ('cookies' in response && typeof (response as any).cookies?.set === 'function') {
    (response as any).cookies.set('domain-info', domainInfoString, {
      httpOnly: false, // Делаем доступным для клиента
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 24 часа
    });
  }
}

// Хелпер для получения domain info из cookies/headers
export function getDomainInfoFromRequest(request: Request): DomainInfo | null {
  try {
    // Пробуем получить из заголовков
    const headerInfo = request.headers.get('x-domain-info');
    if (headerInfo) {
      return JSON.parse(headerInfo);
    }
    
    // Пробуем получить из cookies (если поддерживается)
    if ('cookies' in request && typeof (request as any).cookies.get === 'function') {
      const cookieInfo = (request as any).cookies.get('domain-info');
      if (cookieInfo?.value) {
        return JSON.parse(cookieInfo.value);
      }
    }
    
    return null;
  } catch {
    return null;
  }
}