import React, { useState } from 'react';
import { TextField, Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <Box display="flex" alignItems="center" padding={{ xs: '8px', sm: '16px' }}>
      <TextField
        variant="outlined"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleInputChange}
        fullWidth
      />
      <IconButton onClick={handleSearch} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Box>
  );
};

export default SearchBar;
