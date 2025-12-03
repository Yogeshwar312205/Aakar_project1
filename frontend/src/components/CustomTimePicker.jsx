import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';

const CustomTimePicker = ({ label, value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        value={value}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '10px',
                height: '150px !important', 
                display: 'flex',         
                alignItems: 'center', 
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                height: '100%',
                padding: '0 12px',
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default CustomTimePicker;
