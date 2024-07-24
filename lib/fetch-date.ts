// @ts-nocheck
// TODO: add types

'use server';

import { auth } from 'auth';
import { cookies, headers } from 'next/headers';
import { URL } from 'url';

import { loger } from './console-loger';
import { Env } from './Env';
import { generateApiKey } from './generate-api-key';

export const fetchData = async <T>(
  path: string,
  method: string,
  options: FetchOptions = {},
  query: Record<string, string | number> = {},
): Promise<T> => {
  // try {
  const url = new URL(`${Env.API_SERVER_URL}/${path}`);
  Object.keys(query).forEach((key) => {
    if (query[key] !== 'undefined' && typeof query[key] !== 'undefined') {
      url.searchParams.append(key, query[key] as string);
    }
  });
  const cookiesFromRequest = cookies().get('Authorization')?.value;
  const activeDomain = headers().get('host')?.split('.').shift();
  const domainValue = activeDomain?.startsWith(Env.DOMAIN) ? '' : activeDomain;
  const user = await auth();

  const modifiedOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Auth-Key': user?.auth_key || '',
      Authorization: `Bearer ${generateApiKey()}`,
      'Content-Type': 'application/json',
      ...(options.headers.Domain ? 
        {Domain: options.headers.Domain,}

        : {Domain:  '',}
      )
    },
    ...(options.method !== 'GET' && options.method !== 'HEAD' && { body: JSON.stringify(options.body) }),

  };

  const fetchOptions: RequestInit = {
    method,
    ...modifiedOptions,
  };

  if (!options.cache || domainValue) {
    fetchOptions.cache = 'no-store';
  }

  fetchOptions.next = 0;
  fetchOptions.cache = 'no-store'; // TODO: remove this line after testing
  loger.info('url', url.toString());
  loger.info('fetchOptions', fetchOptions);

  const response = await fetch(url.toString(), fetchOptions);
  if (!response.ok) {
    const errorText = await response.text();
    loger.error('Fetch error', {
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  return (await response.json()) as T;
  // } catch (error) {
  // loger.error('Fetch data error', { error });

  //   throw error;
  // }
};

// export default fetchData;
