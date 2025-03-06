'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ResetPasswordForm } from '../ResetPasswordForm';
// import { PasswordReset } from './PasswordReset';

interface ResetPasswordDialogProps {
  children?: React.ReactNode;
  onResetSuccess?: () => void;
}

export function ResetPasswordDialog({
  children,
  onResetSuccess
}: ResetPasswordDialogProps) {
  const t = useTranslations('resetPassword');
  const [open, setOpen] = useState(false);

  const handleBackToLogin = () => {
    setOpen(false);
  };

  const handleResetSuccess = () => {
    if (onResetSuccess) {
      onResetSuccess();
    }
    // Close the dialog after successful reset
    setTimeout(() => {
      setOpen(false);
    }, 2000); // Give user time to read success message
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="link" className="px-0">
            {t('forgotPassword')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('resetPasswordTitle')}</DialogTitle>
          <DialogDescription>{t('resetPasswordDescription')}</DialogDescription>
        </DialogHeader>
        <ResetPasswordForm
          onBackToLogin={handleBackToLogin}
          onResetSuccess={handleResetSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}