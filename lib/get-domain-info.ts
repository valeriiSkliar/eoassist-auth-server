import { cookies, headers } from 'next/headers';
import { DomainInfo, getDomainZoneFromHeaders } from './domain-zone';

/**
 * Server-side функция для получения информации о доменной зоне
 * Используется в Server Components, Server Actions и API Routes
 */
export async function getDomainInfo(): Promise<DomainInfo> {
  // Сначала пробуем получить из глобальной переменной (установленной в middleware)
  if ((globalThis as any).__DOMAIN_INFO) {
    return (globalThis as any).__DOMAIN_INFO;
  }

  // Если нет глобальной переменной, пробуем получить из cookies
  const cookieStore = await cookies();
  const domainInfoCookie = cookieStore.get('domain-info');
  
  if (domainInfoCookie?.value) {
    try {
      return JSON.parse(domainInfoCookie.value);
    } catch (error) {
      console.error('Failed to parse domain-info cookie:', error);
    }
  }

  // Если нет в cookies, определяем по headers
  const headersList = await headers();
  return getDomainZoneFromHeaders(headersList, cookieStore);
}

/**
 * Хелпер для быстрого получения только доменной зоны
 */
export async function getDomainZone(): Promise<DomainInfo['zone']> {
  const domainInfo = await getDomainInfo();
  return domainInfo.zone;
}

/**
 * Хелпер для проверки конкретной доменной зоны
 */
export async function isDomainZone(zone: DomainInfo['zone']): Promise<boolean> {
  const currentZone = await getDomainZone();
  return currentZone === zone;
}