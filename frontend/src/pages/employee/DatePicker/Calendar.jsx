import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateSelect, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

    const getDays = () => {
        const days = [];
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = daysInMonth(month + 1, year);

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        return days;
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onDateSelect(newDate.toISOString().split('T')[0]); // yyyy-mm-dd format
    };

    return (
        <div className="calendar">
            <button className="close-button" onClick={onClose}>×</button>
            <div className="calendar-header">
                <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="calendar-body">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day">{day}</div>
                ))}
                {getDays().map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${day ? 'clickable' : ''}`}
                        onClick={() => day && handleDateClick(day)}
                    >
                        {day || ''}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
