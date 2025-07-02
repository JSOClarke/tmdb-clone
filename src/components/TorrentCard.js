import React from 'react';
import axios from 'axios';

const TorrentCard = ({ torrent }) => {
  const handlePlayClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/play-torrent', {
        magnetUri: torrent.magnet
      });
      if (response.data.success) {
        alert(`WebTorrent server started. Use this URL to stream: ${response.data.streamUrl}`);
      } else {
        alert(`Failed to start WebTorrent server: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error playing torrent:', error);
      alert('Error playing torrent. Check console for details.');
    }
  };

  return (
    <div className="movie-card">
      <div className="movie-info">
        <h3>{torrent.title}</h3>
        <p><strong>Size:</strong> {torrent.size}</p>
        <p><strong>Seeds:</strong> {torrent.seeds}</p>
        <p><strong>Peers:</strong> {torrent.peers}</p>
        <p><strong>Provider:</strong> {torrent.provider}</p>
        {torrent.link && (
          <p><a href={torrent.link} target="_blank" rel="noopener noreferrer">Download Torrent</a></p>
        )}
        {torrent.desc && (
          <p><a href={torrent.desc} target="_blank" rel="noopener noreferrer">Description Page</a></p>
        )}
        {torrent.magnet && (
          <button onClick={handlePlayClick}>Play with MPV</button>
        )}
      </div>
    </div>
  );
};

export default TorrentCard;
