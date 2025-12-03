import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  '& .MuiPickersCalendarHeader-root': {
    marginBottom: theme.spacing(1), 
  },
  '& .MuiPickersArrowSwitcher-root': {
    display: 'flex',
    gap: '4px', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .MuiIconButton-root': {
    padding: '2px', 
    fontSize: '0.8rem',
    backgroundColor: 'transparent', 
    '&:hover': {
      backgroundColor: 'transparent', 
    },
  },
}));

const CustomDatePicker = ({ label, selected, onChange }) => {
  //const formattedSelected = dayjs.isDayjs(selected) ? selected : dayjs(selected);
  const formattedSelected = selected ? dayjs(selected) : null;

  const handleDateChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      onChange(newValue); 
    } else {
      onChange(null); 
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDatePicker
        label={label}
        value={dayjs(selected)}
        onChange={handleDateChange}
        format="DD-MM-YYYY"
        slots={{
          textField: (params) => (
            <TextField
              {...params}
              error={false}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '10px',
                  height: '50px',
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  height: '100%',
                },
              }}
            />
          ),
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;