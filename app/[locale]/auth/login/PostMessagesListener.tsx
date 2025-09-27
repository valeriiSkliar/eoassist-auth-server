'use client'

import { usePostMessages } from '@/components/provides/postMessage-provider';
import { useEffect, useCallback, type FC } from 'react';

interface PostMessagesListenerProps  {
  className?: string;
}

const PostMessagesListener: FC<PostMessagesListenerProps> = (props) => {
  const { className='', ...otherProps } = props;
  const {setIsLoading} = usePostMessages();


    const handleParentMessages = useCallback((e:MessageEvent) => {
        const {action} = e.data;
        if (action === 'start-answer') {
            setIsLoading(true)
        }

    }, [setIsLoading])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    window.addEventListener('message', handleParentMessages);

    return () => window.removeEventListener(
        'message', handleParentMessages
    );
  }, [handleParentMessages])

  return (
    <div id='PostMessagesListener' className={`${className}`} {...otherProps}>
        
    </div>
  );
};

export default PostMessagesListener;
