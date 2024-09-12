import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const  GET = async (req: NextRequest) => {

    const {nextUrl} = req;
    const cookiesStorage = cookies().getAll();
    cookies().delete('authjs.session-token')
  
  // res.end('Hello from Vercel!');
  return NextResponse.json({
    message: 'Old auth token successfully deleted',
    status: 200,
    success: true,
  })
};