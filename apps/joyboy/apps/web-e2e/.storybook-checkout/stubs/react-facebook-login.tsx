import type { ReactNode } from 'react';

interface FacebookLoginProps {
  callback?: (response: unknown) => void;
  className?: string;
  cssClass?: string;
  icon?: ReactNode;
  textButton?: string;
}

const FacebookLogin = ({ callback, className, cssClass, icon, textButton = 'Facebook Login' }: FacebookLoginProps) => {
  return (
    <button
      className={className || cssClass}
      type="button"
      onClick={() => callback?.({ email: 'storybook@example.com', signedRequest: 'storybook', userID: 'storybook' })}
    >
      {icon}
      {textButton}
    </button>
  );
};

export default FacebookLogin;
