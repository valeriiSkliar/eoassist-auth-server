import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const  GET = async (req: NextRequest) => {

    const {nextUrl} = req;
    req.cookies.set(
      '__Secure-authjs.session-token',
      'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax',
    )
    const cookiesStorage = cookies().getAll();
    cookies().delete('authjs.session-token')
    cookies().delete('__Secure-authjs.session-token')
  
  // res.end('Hello from Vercel!');
  return NextResponse.json({
    message: 'Old auth token successfully deleted',
    status: 200,
    success: true,
  })
};