import React from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';

import Video from '../../containers/Video/Video';

type MovieRouteParams = {
  id: string;
};

const Movie = ({
  match: {
    params: { id },
  },
}: RouteComponentProps<MovieRouteParams>): JSX.Element => {
  const listId: string | null = new URLSearchParams(useLocation().search).get('list');

  if (!listId) return <p>No playlist id</p>;

  return <Video videoType={'movie'} playlistId={listId} mediaId={id} />;
};

export default Movie;