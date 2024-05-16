import React from 'react';

import Button from '../Button/Button';

type OAuthBackToAccountButtonProps = {
  targetUrl: string;
  className?: string;
};

const OAuthBackToAccountButton: React.FC<OAuthBackToAccountButtonProps> = ({ targetUrl, className }) => {
  const backToAccButtonClickHandler = () => {
    window.location.replace(targetUrl || '/');
  };
  return <Button onClick={backToAccButtonClickHandler} label="Back to account" fullWidth className={className} />;
};

export default OAuthBackToAccountButton;
