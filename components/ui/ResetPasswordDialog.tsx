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
import { usePostMessages } from '../provides/postMessage-provider';
// import { PasswordReset } from './PasswordReset';

interface ResetPasswordDialogProps {
  children?: React.ReactNode;
  onResetSuccess?: () => void;
  /**
   * Delay in milliseconds before closing the dialog after successful reset
   * Set to 0 to close immediately
   */
  closeDelay?: number;
}

export function ResetPasswordDialog({
  children,
  onResetSuccess,
  closeDelay = 2000 // Default 2 seconds delay
}: ResetPasswordDialogProps) {
  const { setClose, sendMessage } = usePostMessages();
  const t = useTranslations('resetPassword');
  const [open, setOpen] = useState(false);

  const handleBackToLogin = () => {
    // Notify parent window that user went back to login
    sendMessage({action: 'reset-password-cancelled', key: 'reset-password', value: null});
    setOpen(false);
  };

  const handleResetSuccess = () => {
    if (onResetSuccess) {
      onResetSuccess();
    }
    
    // Send message to parent window about reset password success
    sendMessage({action: 'reset-password-success', key: 'reset-password', value: null});
    
    // Close the dialog after successful reset
    if (closeDelay > 0) {
      setTimeout(() => {
        setOpen(false);
        setClose(true);
        // Send close message when dialog closes after delay
        sendMessage({action: 'close-window', key: 'reset-password', value: null});
      }, closeDelay);
    } else {
      // Close immediately if closeDelay is 0
      sendMessage({action: 'close-window', key: 'reset-password', value: null});
      setOpen(false);
      setClose(true);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Send message when dialog opens or closes
    if (isOpen) {
      sendMessage({action: 'reset-password-opened', key: 'reset-password', value: null});
    } else {
      sendMessage({action: 'reset-password-closed', key: 'reset-password', value: null});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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