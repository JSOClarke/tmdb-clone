import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import DetailPage from './components/DetailPage'; // We will create this component next
import './App.css';

const API_KEY = '641b5a707de7a5e2fb30aaf150880960'; // Replace with your actual TMDB API key
const API_BASE_URL = 'https://api.themoviedb.org/3';

function App() {
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTvShows, setTrendingTvShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data.results)
    } catch (error) {
      setError('Failed to fetch movies. Please try again later.');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moviesResponse, tvShowsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`),
        fetch(`${API_BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=en-US`)
      ]);

      if (!moviesResponse.ok) throw new Error(`HTTP error! status: ${moviesResponse.status} for trending movies`);
      if (!tvShowsResponse.ok) throw new Error(`HTTP error! status: ${tvShowsResponse.status} for trending TV shows`);

      const moviesData = await moviesResponse.json();
      const tvShowsData = await tvShowsResponse.json();

      setTrendingMovies(moviesData.results);
      setTrendingTvShows(tvShowsData.results);
    } catch (error) {
      setError('Failed to fetch trending content. Please try again later.');
      console.error('Error fetching trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setMovies([]); // Clear previous trending data when searching
      fetchMovies(query);
    } else {
      setMovies([]); // Clear search results if query is empty
      fetchTrending(); // Re-fetch trending if search is cleared
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Heretic - TMDB Clone</h1>
          <SearchBar onSearch={handleSearch} />
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}

                {searchQuery ? (
                  // Display search results
                  !loading && !error && movies.length === 0 && (
                    <p className="no-results-message">No results found for "{searchQuery}".</p>
                  )
                ) : (
                  // Display trending content
                  !loading && !error && (
                    <>
                      <h2>Trending Movies</h2>
                      <div className="movie-list">
                        {trendingMovies.map(movie => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </div>

                      <h2>Trending TV Shows</h2>
                      <div className="movie-list">
                        {trendingTvShows.map(tvShow => (
                          <MovieCard key={tvShow.id} movie={tvShow} />
                        ))}
                      </div>
                    </>
                  )
                )}

                {searchQuery && !loading && !error && movies.length > 0 && (
                  <div className="movie-list">
                    {movies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                )}
              </>
            } />
            <Route path="/details/:mediaType/:id" element={<DetailPage API_KEY={API_KEY} API_BASE_URL={API_BASE_URL} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;