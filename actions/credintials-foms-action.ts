'use server'

import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { fetchDataAuth } from "@/lib/fetch-date-auth";
import { redirectAction } from "./redirect-action";

function getSubdomain(url: string): string  {
    // loger.info('url',url);
    if (!url) {
      return '';
    }
    const urlObject = new URL(url);
    const mainDomain = new URL(Env.DOMAIN)
    if (urlObject.hostname === mainDomain.hostname) {
      return '';
    }
    const hostnameParts = urlObject.hostname.split('.');
  
    // Check for at least two parts (subdomain and domain)
    if (hostnameParts.length < 2) {
      return '';
    }
  
    // The subdomain is the part before the top-level domain
    return hostnameParts?.[0] ?? '';
  }

export const credentialsFormAction = async (  
    prevState: { error: undefined | string },
    formData: FormData
) => {
    const email = formData.get('email');
    const password = formData.get('password') ?? '';
    const callbackUrl = formData.get('callbackUrl') ?? Env.DOMAIN;
    const url = new URL('/auth/authorization', callbackUrl.toString());
    const urlStartSession = new URL('/api/start-session', Env.NEXTAUTH_URL);


    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    if (!email?.toString().includes('@')) {
        return { error: 'Invalid email address' };
    }

    if (String(password).length < 8) {
        return { error: 'Password must be at least 8 characters' };
    }
    try {
    const authResponse = await fetchDataAuth<{auth_key:string, domain:string, error: string | null}>('api/users/auth', 'POST', {email, password, headers:{
        Domain: getSubdomain(String(callbackUrl))
    }})
      .catch((error) => {
        loger.error('fetchDataAuth-error', error)
      })

    const startSessionResponse = await fetch(urlStartSession.toString(), { method: 'POST', body: JSON.stringify({
      user:  {...authResponse, email:email.toString()}, 
      searchParams:{callbackUrl: url.toString(),  provider: 'credentials'},
      provider: 'credentials'
    })})
      .then(res => res.json())
      .then(data => {
        loger.info('startSessionResponse', data)
        redirectAction(data.url)
      })
      .catch((error) => {
        // TODO show error tost
        loger.error('startSessionResponse- error', error)
      })

    loger.info('authResponse', authResponse)

    } catch (error) {
        loger.error('error', error)
    }

    return {email, password};
}