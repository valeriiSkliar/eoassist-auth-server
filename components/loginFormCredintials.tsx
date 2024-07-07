'use client'
import { useSearchParams } from 'next/navigation';
import { useRef, useTransition, type FC } from 'react';
import { MdAlternateEmail } from "react-icons/md";
import { usePostMessages } from './provides/postMessage-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginFormCredintialsProps  {
  className?: string;
  originHost: string
}

const LoginFormCredintials: FC<LoginFormCredintialsProps> = ({className, originHost}) => {
  // const [state, formAction] = useFormState<any, FormData>(credentialsFormAction, undefined);
  const serchparams = useSearchParams()
  const {
    isLoading,
    error,
    handleSubmit, 
  } = usePostMessages();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
    <form ref={formRef} className={`space-y-6 ${className}`}>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input disabled={isLoading}  id="email" type="email" name='email' placeholder="Enter your email" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input disabled={isLoading} id="password" type="password" name='password' placeholder="Enter your password" />
    </div>
    <input type="hidden" name="callbackUrl" value={originHost} />
    <Button onClick={(e) => {
      e.preventDefault();
      if (formRef.current) {
        handleSubmit(formRef.current)
      }
    }} disabled={isLoading} type="submit" className="w-full">
    <MdAlternateEmail className="mr-2 h-5 w-5" />
      Sign in
    </Button>
    {error && <p>{error}</p>}
    </form>
    </>
  );
};

export default LoginFormCredintials;
