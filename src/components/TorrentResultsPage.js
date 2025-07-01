import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TorrentCard from './TorrentCard'; // We'll create this next

const TorrentResultsPage = ({ API_KEY, API_BASE_URL }) => {
  const { seriesId, seasonNumber, episodeNumber } = useParams();
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesName, setSeriesName] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('All'); // New state for resolution filter

  useEffect(() => {
    const fetchSeriesDetailsAndTorrents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch series details to get the series name
        const seriesResponse = await axios.get(`${API_BASE_URL}/tv/${seriesId}`, {
          params: {
            api_key: API_KEY,
          },
        });
        const fetchedSeriesName = seriesResponse.data.name;
        setSeriesName(fetchedSeriesName);

        // Construct the search query for the torrent API
        const searchQuery = `${fetchedSeriesName} S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`;
        console.log('Searching for torrents with query:', searchQuery);

        // Fetch torrents from your local server
        const torrentsResponse = await axios.get(`http://localhost:3000/search?q=${encodeURIComponent(searchQuery)}`);
        setTorrents(torrentsResponse.data.data);

      } catch (err) {
        setError('Failed to fetch torrents or series details.');
        console.error('Error fetching torrents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetailsAndTorrents();
  }, [seriesId, seasonNumber, episodeNumber, API_KEY, API_BASE_URL]);

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

  if (loading) return <p>Loading torrents...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="torrent-results-page">
      <h2>Torrents for {seriesName} S{seasonNumber}E{episodeNumber}</h2>
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
        <p>No torrents found for this episode with the selected filter.</p>
      )}
    </div>
  );
};

export default TorrentResultsPage;
