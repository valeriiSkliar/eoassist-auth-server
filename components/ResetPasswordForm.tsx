'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
  onResetSuccess?: () => void;
}

export function ResetPasswordForm({ onBackToLogin, onResetSuccess }: ResetPasswordFormProps) {
  const t = useTranslations('resetPassword');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus({
        type: 'error',
        message: t('emailRequired')
      });
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: null, message: null });
    
    try {
      const response = await fetch(`/api/users/reset-password?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus({
          type: 'success',
          message: t('resetLinkSent')
        });
        onResetSuccess?.();
      } else {
        setStatus({
          type: 'error',
          message: data.message || t('resetError')
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: t('resetError')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {status.type && (
        <Alert variant={status.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <Button type="submit" className="w-full bg-third-80 hover:bg-third-50" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('sending')}
            </>
          ) : (
            t('sendResetLink')
          )}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          {t('backToLogin')}
        </Button>
      </form>
    </div>
  );
}