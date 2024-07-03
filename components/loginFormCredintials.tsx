'use client'
import { credentialsFormAction } from '@/actions/credintials-foms-action';
import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';
import { MdAlternateEmail } from "react-icons/md";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
// @ts-expect-error
import { useFormState } from 'react-dom';

interface LoginFormCredintialsProps  {
  className?: string;
}

const LoginFormCredintials: FC<LoginFormCredintialsProps> = (props) => {
  const { className='', ...otherProps } = props;
  const [state, formAction] = useFormState<any, FormData>(credentialsFormAction, undefined);
  const serchparams = useSearchParams()
  const callbackUrl = serchparams.get('callbackUrl')

  return (
    <form className="space-y-6" action={formAction}>
        
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" name='email' placeholder="Enter your email" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" name='password' placeholder="Enter your password" />
    </div>
    <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />
    <Button type="submit" className="w-full">
    <MdAlternateEmail className="mr-2 h-5 w-5" />

      Sign in
    </Button>
    {state?.error && <p>{state.error}</p>}
    </form>
  );
};

export default LoginFormCredintials;
