'use client'

import { usePostMessages } from '@/components/provides/postMessage-provider';
import { useEffect, type FC } from 'react';

interface PostMessagesListenerProps  {
  className?: string;
}

const PostMessagesListener: FC<PostMessagesListenerProps> = (props) => {
  const { className='', ...otherProps } = props;
  const {setIsLoading} = usePostMessages();


    const handleParentMessages = (e:MessageEvent) => {
        const {action, key, value} = e.data;
        if (action === 'start-answer') {
            setIsLoading(true)
        }

    }

  useEffect(() => {
    window.addEventListener('message', handleParentMessages)

    return () => window.removeEventListener(
        'message', handleParentMessages
    )
  }, [])

  return (
    <div id='PostMessagesListener' className={`${className}`} {...otherProps}>
        
    </div>
  );
};

export default PostMessagesListener;
