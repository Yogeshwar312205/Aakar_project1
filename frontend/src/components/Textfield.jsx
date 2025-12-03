import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

const Textfield = ({ label, value, onChange, name, type = 'text', isRequired}) => {
    const [isFocused, setIsFocused] = useState(false);
    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const getPlaceholder = () => {
        if (type === 'date' && isFocused) {
            return 'dd-mm-yyyy';
        } else if (type === 'time' && isFocused) {
            return 'hh:mm';
        }
        return ''; 
    };

    return (
        <TextField
            label={label}
            variant="outlined"
            value={value}
            onChange={onChange}
            name={name}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
            required={isRequired}
            sx={{
                width: "300px",
                '& .MuiOutlinedInput-root': {
                    height: '50px',
                    borderRadius: 2,
                },
                '& .MuiFormLabel-root': {
                    height: '50px',
                    lineHeight: '50px',
                    top: '-15px',
                },
            }}
        />
    );
};

export default Textfield;
