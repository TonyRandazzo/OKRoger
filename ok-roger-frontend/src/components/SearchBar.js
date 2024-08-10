import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar-container">
      <h1 className='title'>OKRoger</h1>
      <div>
        <input
          className='main-bar'
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search companies"
        />
        <button className='search-button' onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchBar;
