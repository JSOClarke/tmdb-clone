import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TorrentCard from './TorrentCard';

const MovieTorrentResultsPage = ({ API_KEY, API_BASE_URL }) => {
  const SERVER_API_PORT = 3001;
  const { movieId } = useParams();
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('All');

  useEffect(() => {
    const fetchMovieDetailsAndTorrents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch movie details to get the movie title
        const movieResponse = await axios.get(`${API_BASE_URL}/movie/${movieId}`, {
          params: {
            api_key: API_KEY,
          },
        });
        const fetchedMovieTitle = movieResponse.data.title;
        setMovieTitle(fetchedMovieTitle);

        // Construct the search query for the torrent API
        const searchQuery = fetchedMovieTitle;
        console.log('Searching for movie torrents with query:', searchQuery);

        // Fetch torrents from your local server
        const torrentsResponse = await axios.get(`http://localhost:${SERVER_API_PORT}/search?q=${encodeURIComponent(searchQuery)}`);
        setTorrents(torrentsResponse.data.data);

      } catch (err) {
        setError('Failed to fetch movie torrents or details.');
        console.error('Error fetching movie torrents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetailsAndTorrents();
  }, [movieId, API_KEY, API_BASE_URL]);

  const filterTorrents = () => {
    if (selectedResolution === 'All') {
      return torrents;
    }
    const resolutionKeywords = {
      '4K': ['4K', '2160p'],
      '1080p': ['1080p', 'FHD'],
      '720p': ['720p', 'HD'],
    };
    const keywords = resolutionKeywords[selectedResolution];
    return torrents.filter(torrent =>
      keywords.some(keyword => torrent.title.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const filteredTorrents = filterTorrents();

  if (loading) return <p>Loading movie torrents...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="torrent-results-page">
      <h2>Torrents for {movieTitle}</h2>
      <div className="resolution-filters">
        <button onClick={() => setSelectedResolution('All')} className={selectedResolution === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => setSelectedResolution('4K')} className={selectedResolution === '4K' ? 'active' : ''}>4K</button>
        <button onClick={() => setSelectedResolution('1080p')} className={selectedResolution === '1080p' ? 'active' : ''}>1080p</button>
        <button onClick={() => setSelectedResolution('720p')} className={selectedResolution === '720p' ? 'active' : ''}>720p</button>
      </div>
      {filteredTorrents.length > 0 ? (
        <div className="movie-list">
          {filteredTorrents.map((torrent, index) => (
            <TorrentCard key={index} torrent={torrent} />
          ))}
        </div>
      ) : (
        <p>No torrents found for this movie with the selected filter.</p>
      )}
    </div>
  );
};

export default MovieTorrentResultsPage;
