import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EpisodeCard from './EpisodeCard';
import SeasonDropdown from '././SeasonDropdown';
import MovieTorrentTriggerCard from './MovieTorrentTriggerCard';

const DetailPage = ({ API_KEY, API_BASE_URL }) => {
  const { mediaType, id } = useParams();
  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/${mediaType}/${id}`, {
          params: {
            api_key: API_KEY,
            append_to_response: mediaType === 'tv' ? 'season_details' : '',
          },
        });
        setDetails(response.data);

        if (mediaType === 'tv' && response.data.seasons && response.data.seasons.length > 0) {
          setSelectedSeason(response.data.seasons[0].season_number);
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

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (mediaType === 'tv' && details && selectedSeason) {
        setLoading(true);
        setError(null);
        try {
          const episodesResponse = await axios.get(`${API_BASE_URL}/tv/${id}/season/${selectedSeason}`, {
            params: {
              api_key: API_KEY,
            },
          });
          setEpisodes(episodesResponse.data.episodes);
        } catch (err) {
          setError(`Failed to fetch episodes for season ${selectedSeason}.`);
          console.error(`Error fetching episodes for season ${selectedSeason}:`, err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEpisodes();
  }, [selectedSeason, mediaType, id, API_KEY, API_BASE_URL, details]);

  const handleSeasonChange = (event) => {
    setSelectedSeason(parseInt(event.target.value));
  };

  if (!details) return <p>No details found.</p>;

  const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
  const posterSize = 'w780';
  const backdropSize = 'w1280';

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
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}

        {mediaType === 'movie' && (
          <div className="movie-torrent-section">
            {/* <h3>Find Torrents</h3> */}
            <div className="movie-list">
              <MovieTorrentTriggerCard movieId={id} movieTitle={details.title} posterPath={details.poster_path} />
            </div>
          </div>
        )}

        {mediaType === 'tv' && details.seasons && (
          <div className="seasons-dropdown-section">
            <SeasonDropdown
              seasons={details.seasons}
              selectedSeason={selectedSeason}
              onSeasonChange={handleSeasonChange}
            />
          </div>
        )}

        {mediaType === 'tv' && episodes.length > 0 && (
          <div className="episodes-section">
            <div className="episode-list">
              {episodes.map(episode => (
                <EpisodeCard key={episode.id} episode={episode} seriesId={id} seasonNumber={selectedSeason} />
              ))}
            </div>
          </div>
        )}

        {mediaType === 'tv' && details.seasons && (
          <div className="seasons-section">
            <h3>All Seasons:</h3>
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