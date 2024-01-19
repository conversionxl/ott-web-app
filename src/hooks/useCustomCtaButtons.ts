// React hook
import { useMemo } from 'react';

import type { PlaylistItem } from '#types/playlist';
import type { CTAItem } from '#components/CTAButton/CTAButton';

const useCustomCtaButtons = (itemData?: PlaylistItem) => {
  // Check and setup CTAs
  const ctaExam: CTAItem | undefined = useMemo(() => (itemData?.cta_exam ? (JSON.parse(itemData.cta_exam as string) as CTAItem) : undefined), [itemData]);
  const ctaSlides: CTAItem | undefined = useMemo(() => (itemData?.cta_slides ? (JSON.parse(itemData.cta_slides as string) as CTAItem) : undefined), [itemData]);
  const ctaResource1: CTAItem | undefined = useMemo(
    () => (itemData?.cta_resource1 ? (JSON.parse(itemData.cta_resource1 as string) as CTAItem) : undefined),
    [itemData],
  );
  const ctaResource2: CTAItem | undefined = useMemo(
    () => (itemData?.cta_resource2 ? (JSON.parse(itemData.cta_resource2 as string) as CTAItem) : undefined),
    [itemData],
  );
  const ctaResource3: CTAItem | undefined = useMemo(
    () => (itemData?.cta_resource3 ? (JSON.parse(itemData.cta_resource3 as string) as CTAItem) : undefined),
    [itemData],
  );

  return [ctaExam, ctaSlides, ctaResource1, ctaResource2, ctaResource3];
};

export default useCustomCtaButtons;
