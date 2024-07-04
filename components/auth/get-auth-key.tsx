'use client'
import { loger } from '@/lib/console-loger';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FC } from 'react';

interface GetAuthKeyProps  {
  className?: string;
  referal?: string;
  host?: string;
}

const GetAuthKey: FC<GetAuthKeyProps> = (props) => {
  const { className='', ...otherProps } = props;
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const host = searchParams.get('origin')?.toString().slice(0, -1);
  const [hostOrigin, setHostOrigin] = useState(host ?? '');
loger.info('host', host)
  const getAuthKeyForBackend = async () => {
    const response = await fetch('/api/get-auth-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
      const handleLoad = () => {
        window.addEventListener('message', handleMessageFromHost, false);
      };
      window.addEventListener('load', handleLoad);

    if(!sessionStorage.getItem('referer')  && props.host !== props.referal)  {
      sessionStorage.setItem('referer', props.referal ?? '') ;
    }
    const handleMessageFromHost = (event: MessageEvent) => {
      console.log('GetAuthKey', event.data);
    };
    return () => {
      window.removeEventListener('message', handleMessageFromHost);
      window.removeEventListener('load', handleLoad);
      // sessionStorage.removeItem('referer')
      sessionStorage.clear();
    };
  }, []);
  const sendMessage = () => {
    if (window.opener) {
      loger.info('opener', {host ,hostOrigin})
      const targetOrigin = sessionStorage.getItem('referer');
      window.opener.postMessage('Hello, from Popup', targetOrigin);
    }
  };

  return (
    <div className={`${className}`} {...otherProps}>
      <h1>GetAuthKey</h1>
      {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
      {hostOrigin && <pre>{hostOrigin}</pre>}
      <button type="button" onClick={sendMessage}>
        send message
      </button>
    </div>
  );
};

export default GetAuthKey;

