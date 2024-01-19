import React, { MouseEventHandler } from 'react';

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

  const handleClick: MouseEventHandler = (e) => {
    const btn = e.currentTarget as HTMLElement;
    setTimeout(() => btn.blur(), 100);
  };

  return <Button label={label} to={url} fullWidth={breakpoint < Breakpoint.md} target="_blank" onClickCapture={handleClick} />;
};

export default CTAButton;
