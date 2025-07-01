import React from 'react';
import { useParams } from 'react-router-dom';

const EpisodeDetailPage = () => {
  const { airDate } = useParams();

  return (
    <div className="episode-detail-page">
      <h2>Episode Air Date</h2>
      <p>This episode aired on: {airDate}</p>
    </div>
  );
};

export default EpisodeDetailPage;