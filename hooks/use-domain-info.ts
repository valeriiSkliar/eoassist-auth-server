'use client';

import { DomainInfo } from '@/lib/domain-zone';
import { useEffect, useState } from 'react';

export function useDomainInfo(): DomainInfo {
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({
    zone: 'unknown',
    fullDomain: '',
    subdomain: '',
    baseDomain: ''
  });

  useEffect(() => {
    // 1. ПРИОРИТЕТНО: Проверяем URL параметр mirror
    const urlParams = new URLSearchParams(window.location.search);
    const mirrorParam = urlParams.get('mirror');
    
    if (mirrorParam) {
      const zone: DomainInfo['zone'] = mirrorParam === 'ru' ? 'ru' : 
                                      mirrorParam === 'com' ? 'com' : 
                                      mirrorParam === 'store' ? 'store' : 'com'; // по умолчанию
      
      const currentDomain = window.location.hostname;
      const parts = currentDomain.split('.');
      const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';
      const baseDomain = zone === 'ru' ? 'eoassist.ru' : 
                         zone === 'store' ? 'eoassist.store' : 'eoassist.com';
      
      setDomainInfo({
        zone,
        fullDomain: currentDomain,
        subdomain,
        baseDomain
      });
      
      console.log(`DOMAIN-INFO: Detected ${zone} zone from mirror URL param`);
      return;
    }

    // 2. FALLBACK: Пробуем получить из cookies
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
        console.log('DOMAIN-INFO: Loaded from cookie (fallback)');
        return;
      } catch (error) {
        console.error('Failed to parse domain-info cookie:', error);
      }
    }

    // 3. FALLBACK: Если нет в cookies, пробуем определить по текущему URL
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
    
    console.log(`DOMAIN-INFO: Detected ${zone} zone from hostname (fallback)`);
  }, []);

  return domainInfo;
}