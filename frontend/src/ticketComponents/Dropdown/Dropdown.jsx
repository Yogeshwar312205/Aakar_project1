import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectSmall({ label, value, onChange, options, sx }) {
  return (
    <FormControl sx={{ ...sx, m: 1, minWidth: 120 }} size="small">
      <InputLabel id={`select-${label.toLowerCase()}-label`}>{label}</InputLabel>
      <Select
        labelId={`select-${label.toLowerCase()}-label`}
        id={`select-${label.toLowerCase()}`}
        value={value}
        label={label}
        onChange={onChange}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
