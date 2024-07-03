import crypto from 'crypto';
import { Env } from './Env';

const secretKey = Buffer.from(Env.NEXTAUTH_SECRET, 'hex'); 
const iv = crypto.randomBytes(16);

export function encrypt(text: string): { iv: string, encryptedData: string, provider: string | null } {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), provider: null };
}