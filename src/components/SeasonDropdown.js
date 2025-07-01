import React, { useState, useRef, useEffect } from 'react';

const SeasonDropdown = ({ seasons, selectedSeason, onSeasonChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (seasonNumber) => {
    onSeasonChange({ target: { value: seasonNumber } });
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentSeasonName = seasons.find(s => s.season_number === selectedSeason)?.name || 'Select Season';

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-header" onClick={toggleDropdown}>
        <span>{currentSeasonName}</span>
        <span className={`chevron ${isOpen ? 'up' : 'down'}`}>&#9660;</span> {/* Unicode for down arrow */}
      </div>
      {isOpen && (
        <ul className="dropdown-options">
          {seasons.map(season => (
            <li
              key={season.id}
              onClick={() => handleOptionClick(season.season_number)}
              className={season.season_number === selectedSeason ? 'selected' : ''}
            >
              {season.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SeasonDropdown;