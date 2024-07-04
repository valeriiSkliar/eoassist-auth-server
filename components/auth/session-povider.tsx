import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import type { FC } from 'react';

interface SessionPoviderProps  {
  className?: string;
  children: React.ReactNode
}

const SessionPovider: FC<SessionPoviderProps> = async (props) => {
  const { className='', ...otherProps } = props;
  const session = await auth();

  return (
    <SessionProvider session={session} {...otherProps}>{props.children}</SessionProvider>
  );
};

export default SessionPovider;
