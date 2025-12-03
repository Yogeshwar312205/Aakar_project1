import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker'; // Adjust path as needed

const Rnd = () => {
    const [empDOB, setEmpDOB] = useState('');
    const [empAge, setEmpAge] = useState(0);

    function calculateAge(dateString) {
        const [day, month, year] = dateString.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();

        if (today.getMonth() < birthMonth ||
            (today.getMonth() === birthMonth && today.getDate() < birthDay)) {
            age--;
        }
        return age;
    }

    const handleDateChange = (dateString) => {
        if (dateString) {
            const age = calculateAge(dateString);
            setEmpDOB(dateString);
            setEmpAge(age);
        } else {
            setEmpDOB('');
            setEmpAge(0);
        }
    };

    return (
        <div>
            <h1>Add Employee</h1>
            <div>
                <CustomDatePicker
                    id="dob"
                    value={empDOB}
                    onChange={handleDateChange}
                    label="Date of Birth"
                />
            </div>
            <div>Age: {empAge}</div>
        </div>
    );
};

export default Rnd;
