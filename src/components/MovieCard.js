import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const mediaType = movie.media_type === 'movie' ? 'movie' : 'tv'; // Determine media type

  return (
    <Link to={`/details/${mediaType}/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        {movie.poster_path ? (
          <img src={`${IMG_BASE_URL}${movie.poster_path}`} alt={movie.title || movie.name} />
        ) : (
          <div
            style={{
              backgroundColor: 'black',
              color: 'white',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '10px',
              boxSizing: 'border-box',
              fontSize: '1.2em',
              fontWeight: 'bold',
            }}
          >
            {movie.title || movie.name}
          </div>
        )}
        <div className="movie-info">
          <h3>{movie.title || movie.name}</h3>
          <p>{movie.release_date || movie.first_air_date}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;