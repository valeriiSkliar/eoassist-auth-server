import { loger } from "./console-loger";

export function getSubdomain(url: string): string | null {
  loger.info('getSubdomain', url);
  if (
    url === 'https://eoassist.com/' ||
    url === 'eoassist.com' ||
    url === 'eoassist' ||
    url === 'https://liviassist.com/' ||
    url === 'liviassist.com' ||
    url === 'liviassist' ||
    url === 'localhost' ||
    url === 'localhost:3000' ||
    url === 'localhost:4000' ||
    url === 'localhost:3001' || 
    url === 'localhost:3010' ||
    url === 'localhost:3011' ||
    url.startsWith('localhost:3000') || 
    url.startsWith('localhost:4000') ||
    url.startsWith('localhost:3001') || 
    url.startsWith('localhost:3010') ||
    url.startsWith('localhost:3011') ||
    url.startsWith('https://eoassist.com/') ||
    url.startsWith('https://liviassist.com/') ||
    url.startsWith('eoassist.com') ||
    url.startsWith('liviassist.com') ||
    url.startsWith('eoassist') 
    || url.startsWith('liviassist')
  )
    return '';
  if (!url) return '';
  const cleanUrl = url?.replace(/(^\w+:\/\/)/, '');

  const parts = cleanUrl?.split('.');
  if (parts.length < 2) return '';

  if (parts.length > 2) return parts[0] || '';

  const knownTlds = [
    'com',
    'net',
    'org',
    'io',
    'co.uk',
    'ca',
    'de',
    'fr',
    'jp',
  ];

  const firstPart = parts?.[1];
  if (firstPart) {
    if (knownTlds.includes(firstPart)) return '';
  }
  if ((parts[0] === 'eoassist' || parts[0] === 'liviassist' || parts[0] === 'localhost')) return '';

  return parts[0] || '';
}
