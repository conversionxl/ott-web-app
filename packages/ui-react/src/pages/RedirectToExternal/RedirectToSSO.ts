import React, { useEffect } from 'react';
import { useOAuth } from '@jwp/ott-hooks-react/src/useOAuth';
import { useNavigate } from 'react-router-dom';

const RedirectToSSO: React.FC = () => {
  const navigate = useNavigate();
  const { login: oAuthLogin } = useOAuth();

  useEffect(() => {
    oAuthLogin();
  }, [navigate, oAuthLogin]);

  return null; // Render nothing
};

export default RedirectToSSO;
