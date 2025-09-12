import { NextRequest, NextResponse } from 'next/server';
import { getDomainInfo } from '@/lib/get-domain-info';

export async function GET(request: NextRequest) {
  const domainInfo = await getDomainInfo();
  
  return NextResponse.json({
    success: true,
    domainInfo,
    timestamp: new Date().toISOString(),
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      'x-proxy-host': request.headers.get('x-proxy-host'),
      'x-origin-server': request.headers.get('x-origin-server')
    }
  });
}