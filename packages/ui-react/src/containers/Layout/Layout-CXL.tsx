import env from '@jwp/ott-common/src/env';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { unicodeToChar } from '@jwp/ott-common/src/utils/common';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { determinePath } from '@jwp/ott-common/src/utils/urlFormatting';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import HeaderActions from '../../components/Header/HeaderActions';
import HeaderBrand from '../../components/Header/HeaderBrand';
import HeaderMenu from '../../components/Header/HeaderMenu';
import HeaderNavigation from '../../components/Header/HeaderNavigation';
import HeaderSkipLink from '../../components/Header/HeaderSkipLink';
import HeaderLanguageSwitcher from '../HeaderLanguageSwitcher/HeaderLanguageSwitcher';
import HeaderSearch from '../HeaderSearch/HeaderSearch';
import HeaderUserMenu from '../HeaderUserMenu/HeaderUserMenu-CXL';
import SidebarContainer from '../SidebarContainer/SidebarContainer-CXL';
import SiteMetadata from '../SiteMetadata/SiteMetadata';

import styles from './Layout.module.scss';

const Layout = () => {
  const { t } = useTranslation('common');

  const { config } = useConfigStore(
    ({ config, accessModel, supportedLanguages }) => ({
      config,
      accessModel,
      supportedLanguages,
    }),
    shallow,
  );
  const { menu, assets, siteName, styling } = config;
  const { footerText: configFooterText } = styling || {};
  const footerText = configFooterText || unicodeToChar(env.APP_FOOTER_TEXT);

  const { sideBarOpen, searchActive } = useUIStore((state) => ({
    sideBarOpen: state.sideBarOpen,
    searchActive: state.searchActive,
  }));
  const banner = assets.banner;

  const openSideBar = () => useUIStore.setState({ sideBarOpen: true });

  const navItems = [
    { label: t('home'), to: '/' },
    ...menu.map(({ label, contentId, type }) => ({
      label,
      to: determinePath({ type, contentId, label }),
    })),
  ];

  const { custom } = config;

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
  const rightItems = customItems.filter((item) => item.position === 'right');

  navItems.unshift(...beforeItems);
  navItems.push(...afterItems);

  const containerProps = { inert: sideBarOpen ? '' : undefined }; // inert is not yet officially supported in react

  return (
    <div className={styles.layout}>
      <SiteMetadata />
      <div {...containerProps}>
        <Header searchActive={searchActive}>
          <HeaderSkipLink />
          <HeaderMenu sideBarOpen={sideBarOpen} onClick={openSideBar} />
          <HeaderBrand siteName={siteName} logoSrc={banner} setLogoLoaded={() => undefined} />
          <HeaderNavigation navItems={navItems} />
          <HeaderActions>
            {rightItems.map((item, index) => (
              <Button key={index} label={item.label} to={item.to} variant="text" />
            ))}
            <HeaderSearch />
            {!env.APP_OAUTH_ENABLED && <HeaderLanguageSwitcher />}
            <HeaderUserMenu />
          </HeaderActions>
        </Header>
        <main id="content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
        {!!footerText && <Footer text={footerText} />}
      </div>
      <SidebarContainer />
    </div>
  );
};

export default Layout;
