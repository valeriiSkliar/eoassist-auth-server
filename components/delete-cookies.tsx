'use client'
import { loger } from '@/lib/console-loger';
import { useSession } from 'next-auth/react';
import { useEffect, type FC } from 'react';

interface DeleteCookiesProps  {
  className?: string;
}

const DeleteCookies: FC<DeleteCookiesProps> = (props) => {
  const { className='', ...otherProps } = props;
  const session = useSession();


  useEffect(() => {
    const deleteAllCookies = async () => {
    
      document.cookie = "__Secure-authjs.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax";
      loger.info('session', session)
      // if(session.status === 'authenticated') {
      // loger.info('signOut action')

      // signOut()
      // }
        const response = await fetch('api/delete-all-cookies')
      const result = await response.json()

    }

    // deleteAllCookies()
  }, [session])

  return null;
};

export default DeleteCookies;
