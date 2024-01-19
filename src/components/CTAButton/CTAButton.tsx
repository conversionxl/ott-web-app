import React from 'react';

import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Button from '#components/Button/Button';

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

  const onCtaClick = async () => {
    window.location.assign(url);
  };

  return <Button label={label} onClick={onCtaClick} fullWidth={breakpoint < Breakpoint.md} />;
};

export default CTAButton;
