import { createHash, randomBytes } from 'crypto';

let verifierForAuth: { codeVerifier: string; codeChallenge: string } | null = null;// Функции для создания code_verifier и code_challenge
 const generateCodeVerifier = () => {
    return randomBytes(32).toString('base64url');
  };
  
 const generateCodeChallenge = (verifier: string) => {
    return createHash('sha256').update(verifier).digest('base64url');
  };


  const generateVerifierForAuth = () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
      return {
          codeVerifier,
          codeChallenge
      }
  }

export const getverifierForAuth = () => {
    if(verifierForAuth) {
        verifierForAuth = generateVerifierForAuth();
        return verifierForAuth;
    }

    return verifierForAuth;
}
