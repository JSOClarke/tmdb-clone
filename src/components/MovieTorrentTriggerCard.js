import React from 'react';
import { Link } from 'react-router-dom';

const MovieTorrentTriggerCard = ({ movieId, movieTitle }) => {
  return (
    <Link to={`/movie-torrent-results/${movieId}`} className="movie-card-link">
      <div className="movie-card movie-trigger-card">
        <div className="movie-info">
          <h3>Search Torrents for {movieTitle}</h3>
          <p>Click to find available torrents.</p>
          <span className="search-icon">🔍</span> {/* Search icon */}
        </div>
      </div>
    </Link>
  );
};

export default MovieTorrentTriggerCard;
