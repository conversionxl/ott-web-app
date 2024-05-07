// React hook
import { useMemo } from 'react';

import type { CTAItem } from '../components/CTAButton/CTAButton';

const useCustomCtaButtons = (player: any) => {
  const itemData = player.props.seriesItem;

  // Check and setup CTAs
  const customItems = useMemo(() => {
    const allowedKeys = ['cta_exam', 'cta_slides', 'cta_resource1', 'cta_resource2', 'cta_resource3'];
    return allowedKeys.map((key) => {
      if (itemData && !itemData[key]) {
        return undefined;
      }
      if (itemData && itemData[key] && typeof itemData[key] === 'string') {
        try {
          const data = JSON.parse(itemData[key] as string) as CTAItem;
          return data;
        } catch (error: unknown) {
          console.error(`Failed to parse custom item ${key}`);
          console.error(error);
          return undefined;
        }
      }
    });
  }, [itemData]);

  return customItems;
};

export default useCustomCtaButtons;
