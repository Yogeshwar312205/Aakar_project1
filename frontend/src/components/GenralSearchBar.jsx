import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  Box,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import './GeneralSearchBar.css';

function GeneralSearchBar({
  options,
  label,
  displayKey = "label", 
  isMultiSelect = false,
  selectedValues,
  setSelectedValues,
  includeSelectAll = false, 
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false); 

  const enhancedOptions = useMemo(() => {
    if (includeSelectAll) {
      return [{ id: "selectAll", [displayKey]: "Select All" }, ...options];
    }
    return options;
  }, [options, displayKey, includeSelectAll]);

  const handleChange = (event, newValues) => {
    if (isMultiSelect) {
      const isSelectAllSelected = newValues.some(
        (value) => value.id === "selectAll"
      );

      if (isSelectAllSelected) {
        if (selectedValues.length === options.length) {
          setSelectedValues([]); 
        } else {
          setSelectedValues(options); 
        }
      } else {
        setSelectedValues(
          newValues.filter((value) => value.id !== "selectAll")
        ); 
      }
    } else {
      setSelectedValues(newValues || ""); 
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    
  };

  const clearSelection = () => {
    setSelectedValues(isMultiSelect ? [] : "");
    setInputValue(isMultiSelect ? [] : "") 
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    if (!inputValue && !selectedValues.length) setIsFocused(false);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 250, }}>
      <Autocomplete
        multiple={isMultiSelect}
        options={enhancedOptions}
        getOptionLabel={(option) => option[displayKey] || ""}
        value={isMultiSelect ? selectedValues : selectedValues || null}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        disabled={disabled}
        filterOptions={(options, { inputValue }) => {
          const lowerCaseInput = typeof inputValue === "string" ? inputValue.toLowerCase() : "";
          return options.filter((option) =>
            (option[displayKey] || "").toLowerCase().includes(lowerCaseInput)
          );
        }}
        clearOnEscape={false} 
        renderTags={() => null} 
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            sx={{
              "& .MuiInputBase-root": {
                height: "50px",
                backgroundColor: "white",
                cursor: disabled ? "not-allowed" : "auto", 
              },
              "& input": {
                paddingLeft: "10px", 
                cursor: disabled ? "not-allowed" : "auto",
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {inputValue.length > 0 && (
                    <ClearIcon
                      onClick={clearSelection}
                      style={{
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
              sx: { borderRadius: 3 },
            }}

            InputLabelProps={{
              shrink: isFocused || inputValue || selectedValues.length > 0,
              style: {
                transform: isFocused || inputValue || selectedValues.length > 0 ? 'translate(0, -1.5em)' : '',
                fontSize: isFocused || inputValue || selectedValues.length > 0 ? '0.75rem' : '1rem', // Smaller font size when floating
              }, // Floating effect
              sx: {
                left: '17px', // Add left gap for the label
                transform: isFocused || inputValue || selectedValues.length > 0 ? 'translate(0, -1.5em)' : '',
                fontSize: isFocused || inputValue || selectedValues.length > 0 ? '0.75rem' : '1rem', // Smaller size when floating
                paddingLeft: 0, 
              },
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {isMultiSelect ? (
              <>
                <Checkbox
                  checked={
                    option.id === "selectAll"
                      ? selectedValues.length === options.length
                      : selectedValues.some((selected) => selected.id === option.id)
                  }
                />
                <ListItemText primary={option[displayKey]} />
              </>
            ) : (
              <ListItemText primary={option[displayKey]} />
            )}
          </li>
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />

      {isMultiSelect && selectedValues.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            overflowX: "auto",
            gap: 1,
            marginTop: 2,
            padding: "4px 0",
            alignItems: "center",
            "&::-webkit-scrollbar": {
              height: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: 3,
            },
          }}
          >
          {selectedValues.map((option) => (
            <Chip
              key={option.id}
              label={option[displayKey]}
              onDelete={() =>
                setSelectedValues(
                  selectedValues.filter((val) => val.id !== option.id)
                )
              }
              style={{ flexShrink: 0 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

GeneralSearchBar.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      [PropTypes.string]: PropTypes.any, 
    })
  ).isRequired,
  label: PropTypes.string.isRequired,
  displayKey: PropTypes.string,
  isMultiSelect: PropTypes.bool,
  selectedValues: PropTypes.oneOfType([
    PropTypes.array, 
    PropTypes.object, 
  ]).isRequired,
  setSelectedValues: PropTypes.func.isRequired,
  includeSelectAll: PropTypes.bool,
};

export default GeneralSearchBar;
