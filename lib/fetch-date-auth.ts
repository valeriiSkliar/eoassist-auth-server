// @ts-nocheck
// TODO: add types

'use server';

// import { auth } from 'auth';
import { URL } from 'url';

import { Env } from './Env';
import { loger } from './console-loger';
import { generateApiKey } from './generate-api-key';

export const fetchDataAuth = async <T>(
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

  const modifiedOptions = {
    ...options,
    headers: {
      ...options.headers,
      // 'Auth-Key': user?.auth_key || '',
      Authorization: `Bearer ${generateApiKey()}`,
      'Content-Type': 'application/json',
      // Domain: kook || '',
    },
  };

  const fetchOptions: RequestInit = {
    method,
    ...modifiedOptions,
  };

  if (!options.cache) {
    fetchOptions.cache = 'no-store';
  }

  fetchOptions.next = 0;
  fetchOptions.cache = 'no-store'; // TODO: remove this line after testing
  loger.info('url', url.toString());
  loger.info('auth-fetchOptions', fetchOptions);

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

  return (await response.json()) as Promise<T>;
  // } catch (error) {
  // loger.error('Fetch data error', { error });

  //   throw error;
  // }
};

// export default fetchData;
