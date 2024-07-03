import { NextResponse } from "next/server";


const handler = async (req: Request) => {
    const body = await req.json();
    // loger.info('body-auth-server', body)
    // loger.info('req-auth-server', await req.json())
    await fetch('http://alex2002.eoassist.hu/api/auth/start-session', { method: 'POST', body: JSON.stringify(body) })
    return NextResponse.json(JSON.stringify(body));
}
export { handler as GET, handler as POST };

