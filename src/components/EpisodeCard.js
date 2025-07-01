import React from 'react';
import { Link } from 'react-router-dom';

const EpisodeCard = ({ episode, seriesId, seasonNumber }) => {
  const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const stillPath = episode.still_path ? `${IMG_BASE_URL}${episode.still_path}` : '';

  return (
    <Link to={`/torrent-results/${seriesId}/${seasonNumber}/${episode.episode_number}`} className="episode-card-link">
      <div className="episode-card">
        {stillPath ? (
          <div className="episode-image-container">
            <img src={stillPath} alt={episode.name} className="episode-image" />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'black',
              color: 'white',
              width: '100%',
              height: '200px', /* Match image container height */
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '10px',
              boxSizing: 'border-box',
              fontSize: '1em',
              fontWeight: 'bold',
            }}
          >
            {episode.name}
          </div>
        )}
        <div className="episode-info">
          <h4>{episode.episode_number}. {episode.name}</h4>
          <p>{episode.overview || 'No overview available.'}</p>
        </div>
      </div>
    </Link>
  );
};

export default EpisodeCard;