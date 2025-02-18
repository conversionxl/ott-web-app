import { PersonalShelf, PersonalShelves, PLAYLIST_LIMIT } from '@jwp/ott-common/src/constants';
import { useFavoritesStore } from '@jwp/ott-common/src/stores/FavoritesStore';
import { useWatchHistoryStore } from '@jwp/ott-common/src/stores/WatchHistoryStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import type { Content, PlaylistMenuType, PlaylistType } from '@jwp/ott-common/types/config';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useQueries, useQueryClient } from 'react-query';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';

import { getPlaylistQueryOptions } from './usePlaylist';

type UsePlaylistResult = {
  data: Playlist | undefined;
  isSuccess?: boolean;
  error?: unknown;
  isPlaceholderData?: boolean;
}[];

const isPlaylistType = (type: PlaylistType): type is PlaylistMenuType => !PersonalShelves.some((pType) => pType === type);

const usePlaylists = (content: Content[], rowsToLoad: number | undefined = undefined) => {
  const page_limit = PLAYLIST_LIMIT.toString();
  const queryClient = useQueryClient();

  // FEAT:: no favorites for OAuth users until sign in
  const { isOAuthMode } = useConfigStore(({ config }) => ({ isOAuthMode: isTruthyCustomParamValue(config.custom?.isOAuthMode) }), shallow);
  const { user } = useAccountStore.getState();

  const siteId = useConfigStore((state) => state.config.siteId);
  const favorites = useFavoritesStore((state) => state.getPlaylist());
  const watchHistory = useWatchHistoryStore((state) => state.getPlaylist());

  const playlistQueries = useQueries(
    content.map(({ contentId, type }, index) => {
      if (isPlaylistType(type)) {
        return getPlaylistQueryOptions({
          enabled: !rowsToLoad || rowsToLoad > index,
          type,
          siteId,
          contentId,
          queryClient,
          usePlaceholderData: true,
          params: { page_limit },
        });
      }

      return { enabled: false };
    }),
  );

  const result: UsePlaylistResult = content.map(({ type }, index) => {
    if (type === PersonalShelf.Favorites) {
      // FEAT:: no favorites for OAuth users until sign in
      if (isOAuthMode && !user) return { data: undefined, isLoading: false, isSuccess: false };
      return { data: favorites, isLoading: false, isSuccess: true };
    }
    if (type === PersonalShelf.ContinueWatching) {
      // FEAT:: no continue watching for OAuth users until sign in
      if (isOAuthMode && !user) return { data: undefined, isLoading: false, isSuccess: false };
      return { data: watchHistory, isLoading: false, isSuccess: true };
    }

    const { data, isSuccess, error, isPlaceholderData } = playlistQueries[index];

    return {
      data,
      isSuccess,
      error,
      isPlaceholderData,
    };
  });

  return result;
};

export default usePlaylists;
