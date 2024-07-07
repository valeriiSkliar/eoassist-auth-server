'use server'


function getSubdomain(url: string): string  {
    if (!url) {
      return '';
    }
    const urlObject = new URL(url);
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

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    if (!email?.toString().includes('@')) {
        return { error: 'Invalid email address' };
    }

    if (String(password).length < 8) {
        return { error: 'Password must be at least 8 characters' };
    }
    // try {
    // const authResponse = await fetchDataAuth<{auth_key:string, domain:string, error: string | null}>('api/users/auth', 'POST', {email, password, headers:{
    //     Domain: getSubdomain(String(callbackUrl))
    // }})

    // const startSessionResponse = await fetch(urlStartSession.toString(), { method: 'POST', body: JSON.stringify({
    //   user:  {...authResponse, email:email.toString()}, 
    //   searchParams:{callbackUrl: url.toString(),  provider: 'credentials'},
    //   provider: 'credentials'
    // })})
    //   .then(res => res.json())
    //   .then(data => {
    //     redirect(data.url)
    //   })

    // } catch (error) {
    //     loger.error('error', error)
    // }

    return {email, password, error: null};
}