import React, { useState } from 'react';
import Calendar from './Calendar';
import './CustomDatePicker.css';

const CustomDatePicker = ({ value, onChange, id, label }) => {
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
    };

    const handleDateSelect = (date) => {
        setInputValue(date.split('-').reverse().join('-')); // Convert yyyy-mm-dd to dd-mm-yyyy
        onChange(date);
        setIsCalendarVisible(false);
    };

    return (
        <div className="custom-date-picker-container">
            <input
                type="text"
                id={id}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Date of Birth"
                onFocus={() => setIsCalendarVisible(true)}
                onBlur={() => setTimeout(() => setIsCalendarVisible(false), 100)} // Delay hiding to allow calendar interaction
                className="custom-date-picker"
            />
            <label htmlFor={id} className="custom-date-picker-label">
                Date of Birth
            </label>
            {isCalendarVisible && (
                <Calendar
                    selectedDate={inputValue}
                    onDateSelect={handleDateSelect}
                    onClose={() => setIsCalendarVisible(false)}
                />
            )}
        </div>
    );
};

export default CustomDatePicker;
