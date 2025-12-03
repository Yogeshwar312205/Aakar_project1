import React, { useState, useEffect } from 'react'
import { Box, TextField, InputAdornment, Autocomplete } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import './Searchbar.css'

function Searchbar({ items, itemKey, itemLabel, searchLabel, navigateTo }) {
  const [input, setInput] = useState('') // Tracks input value
  const [filteredSuggestions, setFilteredSuggestions] = useState([]) // Tracks filtered search suggestions

  console.log(items)

  const navigate = useNavigate()

  // Effect: Sanitize and prepare the initial list of suggestions
  useEffect(() => {
    const sanitizedList = Array.isArray(items)
      ? items
          .map((item) => item[itemLabel])
          .filter((name) => typeof name === 'string' && name.trim() !== '')
      : []
    setFilteredSuggestions(sanitizedList)
  }, [items, itemLabel])

  // Handle selection from the search bar dropdown
  const handleSelect = (event, value) => {
    if (typeof value === 'string') {
      const selectedItem = items.find(
        (item) => item[itemLabel]?.toLowerCase() === value.toLowerCase()
      )
      if (selectedItem) {
        navigate(`${navigateTo}/${selectedItem[itemKey]}`)
      }
    }
  }

  // Handle live filtering as the user types
  const handleInputChange = (event, newInputValue) => {
    setInput(newInputValue) // Update input value from user
    const filtered = items // Filter items dynamically based on input
      .filter(
        (item) =>
          item[itemLabel] &&
          item[itemLabel].toLowerCase().includes(newInputValue.toLowerCase())
      )
      .map((item) => item[itemLabel])
    setFilteredSuggestions(filtered) // Update filtered suggestions
  }

  return (
    <Box className="searchbar-container">
      <Autocomplete
        freeSolo // Allows users to type freely
        options={filteredSuggestions} // Options to display in dropdown
        inputValue={input} // Controlled input value
        onInputChange={handleInputChange} // Filter items on input change
        onChange={handleSelect} // Handle navigating on selection
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={`${searchLabel}`} // Placeholder dynamically adjusts
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              className: 'searchbar-input',
            }}
            className="searchbar-textfield"
          />
        )}
        sx={{ width: '100%' }}
      />
    </Box>
  )
}

export default Searchbar
