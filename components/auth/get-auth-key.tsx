'use client'
import { loger } from '@/lib/console-loger';
import { useSession } from 'next-auth/react';
import { useEffect, type FC } from 'react';

interface GetAuthKeyProps  {
  // className?: string;
  referal?: string;
  host?: string;
}

const GetAuthKey: FC<GetAuthKeyProps> = ({referal}) => {
  // const { className='', ...otherProps } = props;
  const { data: session } = useSession();
  // const searchParams = useSearchParams();
  // const host = searchParams.get('origin')?.toString().slice(0, -1);

  const sendMessage = () => {
    loger.info('opener', {referal})

    if (window?.opener) {
      window.opener.postMessage('Hello, from Popup', referal);
    }
  };
  useEffect(() => {
    if(session) {
      loger.info('session', session)
      sendMessage()
    }

  }, [session]);


  return (
    <div >
      <h1>GetAuthKey</h1>
      {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
      <button type="button" onClick={sendMessage}>
        send message
      </button>
    </div>
  );
};

export default GetAuthKey;

