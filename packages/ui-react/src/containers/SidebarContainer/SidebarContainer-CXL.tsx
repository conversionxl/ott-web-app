import { ACCESS_MODEL, PLAYLIST_TYPE } from '@jwp/ott-common/src/constants';
import env from '@jwp/ott-common/src/env';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { contentListURL, playlistURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { useOAuth } from '@jwp/ott-hooks-react/src/useOAuth';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button/Button';
import MenuButton from '../../components/MenuButton/MenuButton';
import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './SidebarContainer-CXL.module.scss';

const SidebarUserActions = ({
  sideBarOpen,
  canLogin,
  isLoggedIn,
  onLoginClick,
  onSignUpClick,
}: {
  sideBarOpen: boolean;
  canLogin: boolean;
  isLoggedIn: boolean;
  favoritesEnabled: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}) => {
  const { t } = useTranslation('menu');
  const userMenuTitleId = useOpaqueId('usermenu-title');

  if (!canLogin) return null;

  return isLoggedIn ? (
    <section aria-labelledby={userMenuTitleId} className={styles.buttonContainer}>
      <Button
        onClick={() => {
          window.location.href = env.APP_OAUTH_DASHBOARD_URL as string;
        }}
        label="Back to account"
        fullWidth
      />
    </section>
  ) : (
    <div className={styles.buttonContainer}>
      <Button tabIndex={sideBarOpen ? 0 : -1} onClick={onLoginClick} label={t('sign_in')} fullWidth />
      <Button tabIndex={sideBarOpen ? 0 : -1} variant="contained" color="primary" onClick={onSignUpClick} label={t('sign_up')} fullWidth />
    </div>
  );
};

const SidebarContainer = () => {
  const { t } = useTranslation('common');

  const sideBarOpen = useUIStore((state) => state.sideBarOpen);
  const {
    config: { custom, menu, features },
    accessModel,
  } = useConfigStore((state) => ({
    config: state.config,
    accessModel: state.accessModel,
  }));
  const isLoggedIn = useAccountStore(({ user }) => !!user);

  const favoritesEnabled = !!features?.favoritesList;
  const canLogin = accessModel !== ACCESS_MODEL.AVOD;

  const closeSideBar = () => useUIStore.setState({ sideBarOpen: false });

  const { login: oAuthLogin } = useOAuth();

  const loginButtonClickHandler = () => {
    oAuthLogin();
  };

  const signUpButtonClickHandler = () => {
    window.location.href = env.APP_OAUTH_SIGN_UP_URL as string;
  };

  const customItems = useMemo(() => {
    if (!custom) return [];

    return Object.keys(custom)
      .filter((key) => key.startsWith('navItem'))
      .map((key) => {
        const item = JSON.parse(custom[key] as string);
        item.to = item.url;
        item.key = Math.random().toString();
        return item;
      });
  }, [custom]);

  const beforeItems = customItems.filter((item) => item.position === 'before');
  const afterItems = customItems.filter((item) => item.position === 'after');

  return (
    <Sidebar isOpen={sideBarOpen} onClose={closeSideBar}>
      <ul>
        <li>
          <MenuButton label={t('home')} to="/" />
        </li>
        {beforeItems.map(({ label, to }) => (
          <li key={to}>
            <MenuButton label={label} to={to} />
          </li>
        ))}
        {menu.map(({ contentId, type, label }) => (
          <li key={contentId}>
            <MenuButton label={label} to={type === PLAYLIST_TYPE.content_list ? contentListURL(contentId) : playlistURL(contentId)} />
          </li>
        ))}
        {afterItems.map(({ label, to }) => (
          <li key={to}>
            <MenuButton label={label} to={to} />
          </li>
        ))}
      </ul>
      <SidebarUserActions
        sideBarOpen={sideBarOpen}
        favoritesEnabled={favoritesEnabled}
        canLogin={canLogin}
        isLoggedIn={isLoggedIn}
        onLoginClick={loginButtonClickHandler}
        onSignUpClick={signUpButtonClickHandler}
      />
    </Sidebar>
  );
};

export default SidebarContainer;
