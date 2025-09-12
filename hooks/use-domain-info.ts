'use client';

import { useEffect, useState } from 'react';
import { DomainInfo } from '@/lib/domain-zone';

export function useDomainInfo(): DomainInfo {
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({
    zone: 'unknown',
    fullDomain: '',
    subdomain: '',
    baseDomain: ''
  });

  useEffect(() => {
    // Пробуем получить из cookies
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
      return null;
    };

    const domainInfoCookie = getCookieValue('domain-info');
    if (domainInfoCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(domainInfoCookie));
        setDomainInfo(parsed);
        return;
      } catch (error) {
        console.error('Failed to parse domain-info cookie:', error);
      }
    }

    // Если нет в cookies, пробуем определить по текущему URL
    const currentDomain = window.location.hostname;
    let zone: DomainInfo['zone'] = 'unknown';
    let baseDomain = '';
    let subdomain = '';

    if (currentDomain.includes('eoassist.com')) {
      zone = 'com';
      baseDomain = 'eoassist.com';
    } else if (currentDomain.includes('eoassist.ru')) {
      zone = 'ru';
      baseDomain = 'eoassist.ru';
    } else if (currentDomain.includes('eoassist.store')) {
      zone = 'store';
      baseDomain = 'eoassist.store';
    }

    const parts = currentDomain.split('.');
    if (parts.length > 2) {
      subdomain = parts.slice(0, -2).join('.');
    }

    setDomainInfo({
      zone,
      fullDomain: currentDomain,
      subdomain,
      baseDomain
    });
  }, []);

  return domainInfo;
}