import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './Button.module.scss';

type Color = 'default' | 'primary';

type Variant = 'contained' | 'outlined' | 'text';

type Props = {
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  variant?: Variant;
  onClick?: () => void;
  tabIndex?: number;
  size?: 'medium' | 'large';
  to?: string;
  role?: string;
  className?: string;
} & React.AriaAttributes;

const Button: React.FC<Props> = ({
  label,
  color = 'default',
  startIcon,
  fullWidth = false,
  active = false,
  variant = 'outlined',
  size = 'medium',
  to,
  onClick,
  className,
  ...rest
}: Props) => {
  const combinedClassNames = classNames(styles.button, className, [styles[color]], [styles[variant]], {
    [styles.active]: active,
    [styles.fullWidth]: fullWidth,
    [styles.large]: size === 'large',
  });

  const icon = startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null;
  const span = <span className={styles.buttonLabel}>{label}</span>;

  return to ? (
    <NavLink className={combinedClassNames} to={to} activeClassName={styles.active} {...rest} exact>
      {icon}
      {span}
    </NavLink>
  ) : (
    <button className={combinedClassNames} onClick={onClick} {...rest}>
      {icon}
      {span}
    </button>
  );
};
export default Button;
