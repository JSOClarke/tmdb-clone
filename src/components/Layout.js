import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import SearchBar from './SearchBar';
import MovieCard from './MovieCard'; // Import MovieCard

const Layout = ({ children, onSearch, searchQuery, movies, loading, error }) => {
  return (
    <div className="App">
      <header className="App-header">
          <Link to="/" className="home-logo-link">
            <div className="home-logo">JRDN</div> {/* Placeholder for logo */}
          </Link>
          <div className="header-right-section">
          <SearchBar onSearch={onSearch} />

        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
