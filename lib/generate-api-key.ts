import md5 from 'md5';
import { Env } from './Env';


export const generateApiKey = () => {
  const apiKey = Env.API_KEY;
  const date = new Date().toISOString().split('T')[0];
  const rawKey = `${date}${apiKey}`;
  const sessionKey = md5(rawKey).toString();
  return sessionKey;
};

export const isValidSessionKey = (apiKey: string) => {
  const sessionKey = generateApiKey();
  return apiKey === sessionKey;
};
