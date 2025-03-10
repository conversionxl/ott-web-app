import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import env from '@jwp/ott-common/src/env';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useOAuth } from '@jwp/ott-hooks-react/src/useOAuth';
import { useCallback } from 'react';

import UserMenu from '../../components/UserMenu/UserMenu-CXL';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

const HeaderUserMenu = () => {
  const breakpoint = useBreakpoint();

  const userMenuOpen = useUIStore((state) => state.userMenuOpen);
  const {
    config: { features },
    accessModel,
  } = useConfigStore((state) => ({
    config: state.config,
    accessModel: state.accessModel,
  }));
  const isLoggedIn = useAccountStore(({ user }) => !!user);

  const favoritesEnabled = !!features?.favoritesList;
  const canLogin = accessModel !== ACCESS_MODEL.AVOD;

  const openUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: true }), []);
  const closeUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: false }), []);

  const { login: oAuthLogin } = useOAuth();

  const loginButtonClickHandler = () => {
    oAuthLogin();
  };

  const signUpButtonClickHandler = () => {
    window.location.href = env.APP_OAUTH_SIGN_UP_URL as string;
  };

  if (!canLogin || breakpoint <= Breakpoint.sm) return null;

  return (
    <UserMenu
      open={userMenuOpen}
      onOpen={openUserPanel}
      onClose={closeUserPanel}
      isLoggedIn={isLoggedIn}
      favoritesEnabled={favoritesEnabled}
      onLoginButtonClick={loginButtonClickHandler}
      onSignUpButtonClick={signUpButtonClickHandler}
    />
  );
};

export default HeaderUserMenu;
