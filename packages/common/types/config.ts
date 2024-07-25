import type { PLAYLIST_TYPE } from '../src/constants';

import type { AdScheduleUrls, AdDeliveryMethod } from './ad-schedule';

/**
 * Set config setup changes in both config.services.ts and config.d.ts
 * */
export type Config = {
  id?: string;
  siteName?: string;
  description: string;
  analyticsToken?: string | null;
  adSchedule?: string | null;
  adConfig?: string | null;
  adDeliveryMethod?: AdDeliveryMethod;
  adScheduleUrls?: AdScheduleUrls;
  integrations: {
    cleeng?: Cleeng;
    jwp?: JWP;
  };
  assets: { banner?: string | null };
  content: Content[];
  menu: Menu[];
  styling: Styling;
  features?: Features;
  custom?: Record<string, unknown>;
  contentSigningService?: ContentSigningConfig;
  contentProtection?: ContentProtection;
  siteId: string;
};

export type ContentSigningConfig = {
  host: string;
  drmPolicyId?: string;
};

export type ContentProtection = {
  accessModel: 'free' | 'freeauth' | 'authvod' | 'svod';
  drm?: Drm;
};

export type Drm = {
  defaultPolicyId: string;
};

export type PlaylistType = keyof typeof PLAYLIST_TYPE;

export type PlaylistMenuType = Extract<PlaylistType, 'playlist' | 'content_list'>;

export type Content = {
  contentId?: string;
  title?: string;
  type: PlaylistType;
  featured?: boolean;
  backgroundColor?: string | null;
};

export type Menu = {
  label: string;
  contentId: string;
  type?: PlaylistMenuType;
  filterTags?: string;
};

export type Styling = {
  backgroundColor?: string | null;
  highlightColor?: string | null;
  headerBackground?: string | null;
  /**
   * @deprecated the footerText is present in the config, but can't be updated in the JWP Dashboard
   */
  footerText?: string | null;
};

export type Cleeng = {
  id?: string | null;
  monthlyOffer?: string | null;
  yearlyOffer?: string | null;
  useSandbox?: boolean;
};
export type JWP = {
  clientId?: string | null;
  assetId?: number | null;
  useSandbox?: boolean;
};
export type Features = {
  recommendationsPlaylist?: string | null;
  searchPlaylist?: string | null;
  favoritesList?: string | null;
  continueWatchingList?: string | null;
};

/**
 * AVOD: Advert based
 * AUTHVOD: Authorisation based, needs registration
 * SVOD: Subscription based
 *
 * TVOD: Transactional based. This can only be set per item, so is not a valid accessModel value
 * */
export type AccessModel = 'AVOD' | 'AUTHVOD' | 'SVOD';

export type IntegrationType = 'JWP' | 'CLEENG';
