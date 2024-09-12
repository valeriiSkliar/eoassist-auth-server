'use client'
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
      const response = await fetch('api/delete-all-cookies')
      const result = await response.json()

    }

    deleteAllCookies()
  }, [])

  return null;
};

export default DeleteCookies;
