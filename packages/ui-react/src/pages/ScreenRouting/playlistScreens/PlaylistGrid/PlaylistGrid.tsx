import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { filterPlaylist, getFiltersFromConfig } from '@jwp/ott-common/src/utils/collection';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import env from '@jwp/ott-common/src/env';

import type { ScreenComponent } from '../../../../../types/screens';
import CardGrid from '../../../../components/CardGrid/CardGrid';
import Filter from '../../../../components/Filter/Filter';

import styles from './PlaylistGrid.module.scss';

const PlaylistGrid: ScreenComponent<Playlist> = ({ data, isLoading }) => {
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, data.feedid);
  const filteredPlaylist = useMemo(() => filterPlaylist(data, filter), [data, filter]);
  const shouldShowFilter = Boolean(categories.length);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);
  const isLoggedIn = !!user && (env.APP_OAUTH_UNLOCK_ONLY_PREMIUM ? !!user?.isPremium : true);

  useEffect(() => {
    // reset filter when the playlist id changes
    setFilter('');
  }, [data.feedid]);

  const pageTitle = `${data.title} - ${config.siteName}`;

  const getUrl = (playlistItem: PlaylistItem) => mediaURL({ media: playlistItem, playlistId: playlistItem.feedid });

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <div className={styles.main}>
        <header className={styles.header}>
          <h1>{data.title}</h1>
          {shouldShowFilter && <Filter name="genre" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />}
        </header>
        <CardGrid
          getUrl={getUrl}
          playlist={filteredPlaylist}
          accessModel={accessModel}
          isLoggedIn={isLoggedIn}
          hasSubscription={!!subscription}
          isLoading={isLoading}
          headingLevel={2}
        />
      </div>
    </div>
  );
};

export default PlaylistGrid;
