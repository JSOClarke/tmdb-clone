import React from 'react';

const TorrentCard = ({ torrent }) => {
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
      </div>
    </div>
  );
};

export default TorrentCard;
