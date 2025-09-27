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
    if (hostname.includes('eoassist.com') || hostname.includes('nutroassist.com') || hostname.endsWith('.com')) {
      zone = 'com';
      baseDomain = hostname.includes('nutroassist.com') ? 'nutroassist.com' : 'eoassist.com';
    } else if (hostname.includes('eoassist.ru') || hostname.includes('nutroassist.ru') || hostname.endsWith('.ru')) {
      zone = 'ru';
      baseDomain = hostname.includes('nutroassist.ru') ? 'nutroassist.ru' : 'eoassist.ru';
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
  cookies?: any,
  url?: URL
): DomainInfo {
  // Приоритет определения источника:
  // 1. URL параметр mirror (основной метод)
  // 2. x-proxy-host (для ru-proxy)
  // 3. x-origin-server + host
  // 4. origin header
  // 5. referer header
  // 6. host header
  
  // 1. ПРИОРИТЕТНО: Проверяем URL параметр mirror
  if (url) {
    const mirrorParam = url.searchParams.get('mirror');
    if (mirrorParam) {
      // Определяем зону на основе параметра mirror
      const zone: DomainZone = mirrorParam === 'ru' ? 'ru' : 
                               mirrorParam === 'com' ? 'com' : 
                               mirrorParam === 'store' ? 'store' : 'com'; // по умолчанию
      
      // Используем текущий host для определения полного домена
      const host = headers.get('host') || '';
      return {
        zone,
        fullDomain: host,
        subdomain: host.split('.').length > 2 ? host.split('.').slice(0, -2).join('.') : '',
        baseDomain: zone === 'ru' ? (host.includes('nutroassist') ? 'nutroassist.ru' : 'eoassist.ru') : 
                   zone === 'store' ? 'eoassist.store' : 
                   (host.includes('nutroassist') ? 'nutroassist.com' : 'eoassist.com')
      };
    }
  }

  const xProxyHost = headers.get('x-proxy-host') || cookies?.get('x-proxy-host')?.value;
  const xOriginServer = headers.get('x-origin-server') || cookies?.get('x-origin-server')?.value;
  const origin = headers.get('origin');
  const referer = headers.get('referer');
  const host = headers.get('host');
  
  // 2. FALLBACK: Если есть x-proxy-host (ru-proxy), используем его
  if (xProxyHost) {
    return detectDomainZone(xProxyHost);
  }
  
  // 3. FALLBACK: Если есть origin, используем его
  if (origin) {
    return detectDomainZone(origin);
  }
  
  // 4. FALLBACK: Если есть referer, используем его
  if (referer) {
    return detectDomainZone(referer);
  }
  
  // 5. FALLBACK: Используем host как последний вариант
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