import React from 'react';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Button from '../Button/Button';

type Props = {
  label: string;
  url: string;
};

export type CTAItem = {
  label: string;
  url: string;
  description?: string;
};

const CTAButton = ({ label, url }: Props) => {
  const breakpoint = useBreakpoint();

  return <Button label={label} to={url} fullWidth={breakpoint < Breakpoint.md} target="_blank" />;
};

export default CTAButton;
