import { loger } from './console-loger';

/**
 * Извлекает базовый домен из URL или hostname
 * @param url - URL или hostname для обработки
 * @returns Базовый домен с ведущей точкой для cookies (например, ".eoassist.com") или undefined для localhost
 */
export function getBaseDomainForCookie(url: string): string | undefined {
  try {
    // Если это не полный URL, добавляем протокол
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    const hostname = urlObj.hostname;
    
    // Удаляем www. если есть
    const cleanHostname = hostname.replace(/^www\./, '');
    
    // Определяем базовые домены
    const baseDomains = ['eoassist.com', 'eoassist.ru', 'eoassist.store'];
    
    // Находим соответствующий базовый домен
    for (const baseDomain of baseDomains) {
      if (cleanHostname === baseDomain || cleanHostname.endsWith(`.${baseDomain}`)) {
        return `.${baseDomain}`;
      }
    }
    
    // Если домен не найден в списке, возвращаем его как есть с точкой
    // Это позволит работать на localhost и других доменах для разработки
    if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
      return undefined; // Для localhost не устанавливаем domain в cookie
    }
    
    // Для других доменов возвращаем с точкой
    return `.${cleanHostname}`;
  } catch (error) {
    loger.error('Error parsing domain for cookie', { url, error });
    return undefined;
  }
}

/**
 * Проверяет, является ли домен разрешенным
 * @param domain - Домен для проверки
 * @returns true если домен разрешен
 */
export function isAllowedDomain(domain: string): boolean {
  const allowedDomains = ['eoassist.com', 'eoassist.ru', 'eoassist.store'];
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
  
  return allowedDomains.some(allowed => 
    cleanDomain === allowed || 
    cleanDomain.endsWith(`.${allowed}`)
  );
}

/**
 * Получает URL для редиректа с учетом originHost
 * @param originHost - Исходный хост
 * @param path - Путь для редиректа
 * @returns Полный URL для редиректа
 */
export function getRedirectUrl(originHost: string | null, path: string = '/'): string {
  if (!originHost) {
    // Если originHost не указан, используем текущий домен
    return path;
  }
  
  try {
    const url = originHost.startsWith('http') ? originHost : `https://${originHost}`;
    const urlObj = new URL(url);
    urlObj.pathname = path;
    return urlObj.toString();
  } catch (error) {
    loger.error('Error creating redirect URL', { originHost, path, error });
    return path;
  }
}

/**
 * Извлекает поддомен из URL
 * @param url - URL для обработки
 * @returns Поддомен или null
 */
export function getSubdomainFromUrl(url: string): string | null {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    const hostname = urlObj.hostname;
    
    // Удаляем www. если есть
    const cleanHostname = hostname.replace(/^www\./, '');
    
    // Базовые домены
    const baseDomains = ['eoassist.com', 'eoassist.ru', 'eoassist.store'];
    
    for (const baseDomain of baseDomains) {
      if (cleanHostname.endsWith(`.${baseDomain}`)) {
        // Извлекаем поддомен
        const subdomain = cleanHostname.replace(`.${baseDomain}`, '');
        return subdomain !== cleanHostname ? subdomain : null;
      }
    }
    
    return null;
  } catch (error) {
    loger.error('Error extracting subdomain', { url, error });
    return null;
  }
}