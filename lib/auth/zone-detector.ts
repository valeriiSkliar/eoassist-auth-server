// lib/auth/zone-detector.ts
import { cookies, headers } from "next/headers"
import { NextRequest } from "next/server"

export type Zone = 'com' | 'ru'

/**
 * Определяет зону на основе различных индикаторов запроса
 * Приоритет: URL параметр mirror > headers > cookies > URL params > host
 */
export async function detectZone(req?: NextRequest): Promise<Zone> {
  // 1. ПРИОРИТЕТНО: Проверяем URL параметр mirror (основной метод)
  if (req) {
    const url = new URL(req.url)
    const mirrorParam = url.searchParams.get('mirror')
    
    if (mirrorParam === 'com') {
      console.log('ZONE-DETECT: Detected COM zone from mirror param')
      return 'com'
    }
    if (mirrorParam === 'ru') {
      console.log('ZONE-DETECT: Detected RU zone from mirror param')
      return 'ru'
    }
    // Можно добавить другие зоны при необходимости
    if (mirrorParam) {
      console.log(`ZONE-DETECT: Detected ${mirrorParam} zone from mirror param, defaulting to COM`)
      return 'com' // по умолчанию для неизвестных значений
    }
  }

  // 2. FALLBACK: Проверяем headers от nginx proxy
  const headersList = await headers()
  const xOriginServer = headersList.get('x-origin-server')
  const xProxyHost = headersList.get('x-proxy-host')
  
  if (xOriginServer === 'ru-proxy' || xProxyHost?.includes('.ru')) {
    console.log('ZONE-DETECT: Detected RU zone from headers (fallback)')
    return 'ru'
  }
  
  // 3. FALLBACK: Проверяем cookies
  const cookieStore = await cookies()
  const ruProxyCookie = cookieStore.get('ru-proxy')
  const ruProxyHostCookie = cookieStore.get('ru-proxy-host')
  
  if (ruProxyCookie?.value === 'true' || ruProxyHostCookie?.value?.includes('.ru')) {
    console.log('ZONE-DETECT: Detected RU zone from cookies (fallback)')
    return 'ru'
  }
  
  // 4. FALLBACK: Проверяем дополнительные URL параметры (для OAuth callback)
  if (req) {
    const url = new URL(req.url)
    const ruProxy = url.searchParams.get('ruProxy')
    const ruProxyHost = url.searchParams.get('ruProxyHost')
    const state = url.searchParams.get('state')
    
    if (ruProxy === 'true' || ruProxyHost?.includes('.ru')) {
      console.log('ZONE-DETECT: Detected RU zone from legacy URL params (fallback)')
      return 'ru'
    }
    
    // 5. FALLBACK: Проверяем state параметр (может содержать информацию о зоне)
    if (state) {
      try {
        const decodedState = Buffer.from(state, 'base64').toString()
        if (decodedState.includes('zone:ru')) {
          console.log('ZONE-DETECT: Detected RU zone from state param (fallback)')
          return 'ru'
        }
      } catch (e) {
        // State может быть не base64
      }
    }
  }
  
  // 6. FALLBACK: Проверяем host header
  const host = headersList.get('host')
  if (host?.includes('.ru')) {
    console.log('ZONE-DETECT: Detected RU zone from host (fallback)')
    return 'ru'
  }
  
  console.log('ZONE-DETECT: Defaulting to COM zone (no indicators found)')
  return 'com'
}

/**
 * Сохраняет информацию о зоне в state для OAuth flow
 */
export function encodeZoneInState(zone: Zone, originalState?: string): string {
  const stateData = {
    zone,
    originalState,
    timestamp: Date.now()
  }
  return Buffer.from(JSON.stringify(stateData)).toString('base64')
}

/**
 * Извлекает информацию о зоне из state
 */
export function decodeZoneFromState(state: string): { zone: Zone; originalState?: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64').toString()
    const data = JSON.parse(decoded)
    return {
      zone: data.zone || 'com',
      originalState: data.originalState
    }
  } catch {
    return null
  }
}