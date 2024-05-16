import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import ProfileController from '@jwp/ott-common/src/controllers/ProfileController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { isTruthyCustomParamValue, unicodeToChar } from '@jwp/ott-common/src/utils/common';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useSearchQueryUpdater from '@jwp/ott-ui-react/src/hooks/useSearchQueryUpdater';
import { useProfiles, useSelectProfile } from '@jwp/ott-hooks-react/src/useProfiles';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';
import { PATH_HOME, PATH_USER_PROFILES } from '@jwp/ott-common/src/paths';
import { playlistURL } from '@jwp/ott-common/src/utils/urlFormatting';
import env from '@jwp/ott-common/src/env';
import { useOAuth } from '@jwp/ott-hooks-react/src/useOAuth';

import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import MenuButton from '../../components/MenuButton/MenuButton';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import UserMenu from '../../components/UserMenu/UserMenu';
import OAuthBackToAccountButton from '../../components/OAuthBackToAccountButton/OAuthBackToAccountButton';

import styles from './Layout.module.scss';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');

  const { config, accessModel, supportedLanguages } = useConfigStore(
    ({ config, accessModel, supportedLanguages }) => ({ config, accessModel, supportedLanguages }),
    shallow,
  );
  const userMenuTitleId = useOpaqueId('usermenu-title');
  const isLoggedIn = !!useAccountStore(({ user }) => user);
  const favoritesEnabled = !!config.features?.favoritesList;
  const { menu, assets, siteName, description, features, styling, custom } = config;

  const customItems = useMemo(() => {
    if (!custom) return [];

    return Object.keys(custom)
      .filter((key) => key.startsWith('navItem'))
      .map((key) => {
        const item = JSON.parse(custom[key] as string);
        item.key = Math.random().toString();
        return item;
      });
  }, [custom]);

  const beforeItems = customItems.filter((item) => item.position === 'before');
  const rightItems = customItems.filter((item) => item.position === 'right');
  const afterItems = customItems.filter((item) => !['before', 'right'].includes(item.position));

  const metaDescription = description || t('default_description');
  const { footerText: configFooterText } = styling || {};
  const footerText = configFooterText || unicodeToChar(env.APP_FOOTER_TEXT);

  const profileController = getModule(ProfileController, false);

  const { searchPlaylist } = features || {};
  const hasAppContentSearch = isTruthyCustomParamValue(custom?.appContentSearch);
  const searchEnabled = !!searchPlaylist || hasAppContentSearch;

  const isOAuthMode = isTruthyCustomParamValue(custom?.isOAuthMode);
  const { login: oAuthLogin } = useOAuth();

  const currentLanguage = useMemo(() => supportedLanguages.find(({ code }) => code === i18n.language), [i18n.language, supportedLanguages]);

  const {
    query: { data: { collection: profiles = [] } = {} },
    profilesEnabled,
  } = useProfiles();

  const selectProfile = useSelectProfile({
    onSuccess: () => navigate(PATH_HOME),
    onError: () => navigate(PATH_USER_PROFILES),
  });

  const { searchQuery, searchActive, userMenuOpen, languageMenuOpen } = useUIStore(
    ({ searchQuery, searchActive, userMenuOpen, languageMenuOpen }) => ({
      languageMenuOpen,
      searchQuery,
      searchActive,
      userMenuOpen,
    }),
    shallow,
  );
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();
  const { profile } = useProfileStore();

  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const banner = assets.banner;
  const canLogin = accessModel !== ACCESS_MODEL.AVOD;

  useEffect(() => {
    if (isLoggedIn && profilesEnabled && !profiles?.length) {
      profileController?.unpersistProfile();
    }
    // Trigger once on the initial page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: `${location.pathname}${location.search || ''}`,
    });
  };

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    useUIStore.setState({
      searchActive: false,
    });
  };

  const loginButtonClickHandler = () => {
    // if user is in oauth mode, redirect to the login page
    if (isOAuthMode) {
      oAuthLogin();
      return;
    }
    navigate(modalURLFromLocation(location, 'login'));
  };

  const signUpButtonClickHandler = () => {
    // if user is in oauth mode, redirect to the pricing page
    if (isOAuthMode) {
      window.location.replace(env.APP_OAUTH_SIGN_UP_URL as string);
      return;
    }
    navigate(modalURLFromLocation(location, 'create-account'));
  };

  const languageClickHandler = async (code: string) => {
    await i18n.changeLanguage(code);
  };

  // useCallbacks are used here to fix a bug in the Popover when using a Reactive onClose callback
  const openUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: true }), []);
  const closeUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: false }), []);
  const openLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: true }), []);
  const closeLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: false }), []);

  const renderUserActions = (sideBarOpen: boolean) => {
    if (!canLogin) return null;

    // FEAT:: back to main account cta if oauth mode
    if (isLoggedIn && isOAuthMode) {
      return (
        <section aria-labelledby={userMenuTitleId} className={styles.buttonContainer}>
          <OAuthBackToAccountButton targetUrl={env.APP_OAUTH_DASHBOARD_URL as string} className={styles.backToAccount} />
        </section>
      );
    }

    return isLoggedIn ? (
      <section aria-labelledby={userMenuTitleId}>
        <UserMenu focusable={sideBarOpen} favoritesEnabled={favoritesEnabled} titleId={userMenuTitleId} showPaymentsItem />
      </section>
    ) : (
      <div className={styles.buttonContainer}>
        <Button tabIndex={sideBarOpen ? 0 : -1} onClick={loginButtonClickHandler} label={t('sign_in')} fullWidth />
        <Button tabIndex={sideBarOpen ? 0 : -1} variant="contained" color="primary" onClick={signUpButtonClickHandler} label={t('sign_up')} fullWidth />
      </div>
    );
  };

  const navItems = [
    { label: t('home'), to: '/' },
    ...menu.map((item) => ({
      label: item.label,
      to: playlistURL(item.contentId),
    })),
  ];

  const containerProps = { inert: sideBarOpen ? '' : undefined }; // inert is not yet officially supported in react

  return (
    <div className={styles.layout}>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:title" content={siteName} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>
      <div {...containerProps}>
        <Header
          onMenuButtonClick={() => setSideBarOpen(true)}
          logoSrc={banner}
          searchEnabled={searchEnabled}
          searchBarProps={{
            query: searchQuery,
            onQueryChange: (event) => updateSearchQuery(event.target.value),
            onClearButtonClick: () => updateSearchQuery(''),
            inputRef: searchInputRef,
          }}
          searchActive={searchActive}
          onSearchButtonClick={searchButtonClickHandler}
          onCloseSearchButtonClick={closeSearchButtonClickHandler}
          onLoginButtonClick={loginButtonClickHandler}
          onSignUpButtonClick={signUpButtonClickHandler}
          onLanguageClick={languageClickHandler}
          supportedLanguages={supportedLanguages}
          currentLanguage={currentLanguage}
          isLoggedIn={isLoggedIn}
          sideBarOpen={sideBarOpen}
          userMenuOpen={userMenuOpen}
          languageMenuOpen={languageMenuOpen}
          openUserPanel={openUserPanel}
          closeUserPanel={closeUserPanel}
          openLanguageMenu={openLanguageMenu}
          closeLanguageMenu={closeLanguageMenu}
          canLogin={canLogin}
          showPaymentsMenuItem={accessModel !== ACCESS_MODEL.AVOD}
          favoritesEnabled={favoritesEnabled}
          siteName={siteName}
          profilesData={{
            currentProfile: profile,
            profiles,
            profilesEnabled,
            selectProfile: ({ avatarUrl, id }) => selectProfile.mutate({ id, avatarUrl }),
            isSelectingProfile: selectProfile.isLoading,
          }}
          navItems={navItems}
          isOAuthMode={isOAuthMode}
        >
          <Button activeClassname={styles.headerButton} label={t('home')} to="/" variant="text" />
          {menu.map((item) => (
            <Button activeClassname={styles.headerButton} key={item.contentId} label={item.label} to={playlistURL(item.contentId)} variant="text" />
          ))}
        </Header>
        <main id="content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
        {!!footerText && <Footer text={footerText} />}
      </div>
      <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
        <ul>
          <li>
            <MenuButton label={t('home')} to="/" />
          </li>
          {beforeItems.map((item) => (
            <MenuButton key={item.key} label={item.label} to={item.url} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
          {menu.map((item) => (
            <li key={item.contentId}>
              <MenuButton label={item.label} to={playlistURL(item.contentId)} />
            </li>
          ))}
          {afterItems.map((item) => (
            <MenuButton key={item.key} label={item.label} to={item.url} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
        </ul>
        {rightItems.map((item) => (
          <MenuButton key={item.key} label={item.label} to={item.url} tabIndex={sideBarOpen ? 0 : -1} />
        ))}
        {renderUserActions(sideBarOpen)}
      </Sidebar>
    </div>
  );
};

export default Layout;
