'use client';
import { useState, useCallback } from 'react';
import { Link } from '@castlery/fortress';
import { AuthModal } from '@castlery/shared-components';

export interface LoginButtonProps {
  /**
   * Callback function when login succeeds
   * If not provided, defaults to page reload
   */
  onLoginSuccess?: () => void;
  /**
   * Text to display on the login button
   * @default 'Log in'
   */
  buttonText?: string;
  /**
   * Additional CSS classes for the button
   */
  className?: string;
}

export const LoginButton = ({ onLoginSuccess, buttonText = 'Log in', className }: LoginButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      // Fallback to page reload if no callback provided
      window.location.reload();
    }
  }, [onLoginSuccess]);

  return (
    <>
      <Link level="caption2" variant="primary" component="button" onClick={handleOpen} className={className}>
        {buttonText}
      </Link>
      <AuthModal open={open} onClose={handleClose} onSuccess={handleSuccess} />
    </>
  );
};
