import { loger } from "@/lib/console-loger";
import { encrypt } from "@/lib/encript-session";
import { newUserCredintialsSchema, newUserRequestSchema } from "@/lib/schemas-zod";
import { NextRequest, NextResponse } from "next/server";

const notAllowed = async () => {
    return NextResponse.json({
        success: false,
        message: "Method not allowed"
    })
}

 export const POST = async (req: NextRequest) => {
    try {
        const body = await getRequestBody(req);
        const {user, searchParams} = checkBodyData(body);
        const encryptedUser = encrypt(JSON.stringify(user));
        if (searchParams?.provider) {
          encryptedUser.provider = searchParams?.provider
        }
        const url = createUrlWithSearchParams(searchParams.callbackUrl, encryptedUser);
        loger.info('url-start-session', url)
        const response = NextResponse.redirect(url);

        return response;
    } catch (error) {
        loger.error('error-start-session', error)
        const response = NextResponse.json({ succes: false, message: `Error starting session. Error message: ${error}. Auth server - start-session` });
        return response;
    }

  };



export { notAllowed as DELETE, notAllowed as GET, notAllowed as HEAD, notAllowed as OPTIONS, notAllowed as PATCH, notAllowed as PUT };


//   PRIVATE FUNCTIONS

const getRequestBody = async (req: NextRequest) => {
    const body = await req.json();
    // loger.info('body-auth-server', body)
    return body;
  }
  
  const createUrlWithSearchParams = (url: string, params: Record<string, string | null>): string => {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value?.toString() ?? '');
    });
    return urlObj.href;
  }

  const checkBodyData = (body: any) => {
    if (body?.provider) {
      const credentials = newUserCredintialsSchema.safeParse(body);
      if (!credentials.success) {
        throw new Error("Invalid user data");
      }
      return credentials.data;
    }
    if (!body) {
      throw new Error("Missing user data");
    }

    const parsedBodyData = newUserRequestSchema.safeParse(body);
    if (!parsedBodyData.success) {
      throw new Error("Invalid user data");
    }
    return parsedBodyData.data;
  }