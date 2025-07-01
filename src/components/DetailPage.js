import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EpisodeCard from './EpisodeCard';

const DetailPage = ({ API_KEY, API_BASE_URL }) => {
  const { mediaType, id } = useParams();
  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]); // New state for episodes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/${mediaType}/${id}`, {
          params: {
            api_key: API_KEY,
            append_to_response: mediaType === 'tv' ? 'season_details' : '', // Fetch season details for TV shows
          },
        });
        setDetails(response.data);

        // Fetch episodes for Season 1 if it exists
        if (mediaType === 'tv' && response.data.seasons && response.data.seasons.length > 0) {
          const season1 = response.data.seasons.find(season => season.season_number === 1);

          if (season1) {
            const episodesResponse = await axios.get(`${API_BASE_URL}/tv/${id}/season/1`, {
              params: {
                api_key: API_KEY,
              },
            });
            setEpisodes(episodesResponse.data.episodes);
          }
        }

      } catch (err) {
        setError('Failed to fetch details.');
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [mediaType, id, API_KEY, API_BASE_URL]);

  if (loading) return <p>Loading details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!details) return <p>No details found.</p>;

  const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
  const posterSize = 'w780'; // High-res poster
  const backdropSize = 'w1280'; // High-res backdrop

  const backdropPath = details.backdrop_path ? `${IMG_BASE_URL}${backdropSize}${details.backdrop_path}` : '';
  const posterPath = details.poster_path ? `${IMG_BASE_URL}${posterSize}${details.poster_path}` : '';

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ backgroundImage: `url(${backdropPath})` }}>
        <div className="header-overlay"></div>
        <div className="header-content">
          {posterPath && (
            <div className="header-poster-container">
              <img src={posterPath} alt={details.title || details.name} className="header-poster-image" />
            </div>
          )}
          <div className="header-info-section">
            <h1>{details.title || details.name}</h1>
            <p><strong>Release Date:</strong> {details.release_date || details.first_air_date}</p>
            {details.genres && (
              <p><strong>Genres:</strong> {details.genres.map(g => g.name).join(', ')}</p>
            )}
            <p className="overview">{details.overview}</p>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {mediaType === 'tv' && details.number_of_seasons && (
          <p><strong>Number of Seasons:</strong> {details.number_of_seasons}</p>
        )}
        {mediaType === 'tv' && episodes.length > 0 && (
          <div className="episodes-section">
            <h3>Episodes (Season {details.seasons[0].season_number}):</h3>
            <div className="episode-list">
              {episodes.map(episode => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </div>
        )}
        {mediaType === 'tv' && details.seasons && (
          <div className="seasons-section">
            <h3>Seasons:</h3>
            <ul>
              {details.seasons.map(season => (
                <li key={season.id}>
                  <h4>{season.name}</h4>
                  <p>Episodes: {season.episode_count}</p>
                  <p>{season.overview}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;