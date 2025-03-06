// middlewares/withCorsMiddleware.ts
import { NextResponse } from "next/server";
import { CustomMiddleware } from './chain';

export function withCorsMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // request.cookies.set('Authorization', `Bearer ${generateApiKey()}`);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        headers: response.headers,
        status: 204,
      });
    }

    return middleware(request, event, response);
  };
}