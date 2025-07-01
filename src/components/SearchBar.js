import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TMDB_API_KEY = '641b5a707de7a5e2fb30aaf150880960'; // Replace with your actual TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Custom hook to detect clicks outside a component
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const ignoreNextQueryChange = useRef(false); // New ref

  useClickOutside(searchContainerRef, () => {
    setShowSuggestions(false);
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (ignoreNextQueryChange.current) {
        ignoreNextQueryChange.current = false; // Reset the flag
        return; // Do not fetch suggestions
      }

      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchSuggestions = async (searchText) => {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        params: {
          api_key: TMDB_API_KEY,
          query: searchText,
        },
      });
      setSuggestions(response.data.results.filter(item => item.media_type !== 'person'));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedQuery = suggestion.title || suggestion.name;
    ignoreNextQueryChange.current = true; // Set flag before updating query
    setQuery(selectedQuery);
    onSearch(selectedQuery);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search for Media..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
        />
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion.title || suggestion.name} ({suggestion.release_date ? suggestion.release_date.substring(0, 4) : (suggestion.first_air_date ? suggestion.first_air_date.substring(0, 4) : 'N/A')})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;