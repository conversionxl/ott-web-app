import env from '@jwp/ott-common/src/env';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import HeaderActionButton from '../Header/HeaderActionButton';
import Icon from '../Icon/Icon';
import Panel from '../Panel/Panel';
import Popover from '../Popover/Popover';
import UserMenuNav from '../UserMenuNav/UserMenuNav';

import styles from './UserMenu.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onLoginButtonClick: () => void;
  onSignUpButtonClick: () => void;
  isLoggedIn: boolean;
  favoritesEnabled: boolean;
};

const UserMenu = ({ isLoggedIn, favoritesEnabled, open, onClose, onOpen, onLoginButtonClick, onSignUpButtonClick }: Props) => {
  const { t } = useTranslation('menu');

  const isOAuthMode = env.APP_OAUTH_ENABLED;

  const { user } = useAccountStore(({ user }) => ({ user }), shallow);

  const isPremium = user?.isPremium;

  if (!isLoggedIn) {
    return (
      <>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} aria-haspopup="dialog" />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} aria-haspopup="dialog" />
      </>
    );
  }

  if (isLoggedIn && isOAuthMode && isPremium) {
    return (
      // @eslint-disable-next-line no-restricted-globals
      <Button
        onClick={() => {
          window.location.href = env.APP_OAUTH_DASHBOARD_URL as string;
        }}
        label="Back to account"
        aria-haspopup="dialog"
      />
    );
  }

  if (!isOAuthMode) {
    return (
      <div>
        <HeaderActionButton
          aria-label={t('open_user_menu')}
          aria-controls="menu_panel"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={onOpen}
          onBlur={onClose}
        >
          <Icon icon={AccountCircle} />
        </HeaderActionButton>
        <Popover className={styles.popover} isOpen={open} onClose={onClose}>
          <Panel id="menu_panel">
            <div onFocus={onOpen} onBlur={onClose}>
              <UserMenuNav focusable={open} onButtonClick={onClose} showPaymentItems={true} favoritesEnabled={favoritesEnabled} small />
            </div>
          </Panel>
        </Popover>
      </div>
    );
  }
};

export default UserMenu;
