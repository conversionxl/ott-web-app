import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { getModule } from '@jwp/ott-common/src/modules/container';
import EntitlementController from '@jwp/ott-common/src/controllers/EntitlementController';

import { generateJwtSignedContentToken, useOAuth } from './useOAuth';

export default function useProtectedMedia(item: PlaylistItem) {
  const entitlementController = getModule(EntitlementController);
  const { i18n } = useTranslation();
  const { language } = i18n;

  const { token: bearerToken } = useOAuth();
  const promiseToken = generateJwtSignedContentToken(item.mediaid, `Bearer ${bearerToken}`);

  return useQuery(['media-signed', item.mediaid, language], async () => entitlementController.getSignedMedia(item.mediaid, language, undefined, promiseToken), {
    retry: 2,
    retryDelay: 1000,
    keepPreviousData: false,
  });
}
