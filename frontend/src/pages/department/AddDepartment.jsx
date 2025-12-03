import React, {useState} from 'react';
import {FiArrowLeftCircle, FiEdit} from 'react-icons/fi';
import './AddDepartment.css';
import TextField from '@mui/material/TextField';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {useDispatch} from "react-redux";
import {addDepartment} from "../..//features/departmentSlice.js";
import {Bounce, toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const AddDepartment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const projectColumns = [
        {id: 'projectName', label: 'Project name', align: 'center'},
        {id: 'projectNumber', label: 'Project number', align: 'center'},
        {id: 'startDate', label: 'Start date', align: 'center'},
        {id: 'endDate', label: 'End date', align: 'center'},
    ];

    const rows = [];

    const [departmentName, setDepartmentName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [departmentStartDate, setDepartmentStartDate] = useState(null);
    const [departmentEndDate, setDepartmentEndDate] = useState(null);

    // Handles date change
    const handleDateChange = (type, newDate) => {
        if (type === 'start') {
            const selectedStartDate = newDate ? dayjs(newDate) : null;
            if (departmentEndDate && selectedStartDate && selectedStartDate.isAfter(departmentEndDate)) {
                alert('Start date must be before End date.');
            } else {
                setDepartmentStartDate(selectedStartDate); // Keep as dayjs object for DatePicker
            }
        } else if (type === 'end') {
            const selectedEndDate = newDate ? dayjs(newDate) : null;
            if (departmentStartDate && selectedEndDate && selectedEndDate.isBefore(departmentStartDate)) {
                alert('End date must be after Start date. Setting End date to today.');
                setDepartmentEndDate(dayjs()); // Set to today's date (as dayjs object)
            } else {
                setDepartmentEndDate(selectedEndDate); // Keep as dayjs object for DatePicker
            }
        }
    };

    const notify = () =>
        toast.success('Employee Added Successfully!', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
        });


    const handleSubmit = () => {
        const payload = {
            departmentName,
            departmentStartDate: departmentStartDate ? departmentStartDate.format('YYYY-MM-DD') : null,
            departmentEndDate: departmentEndDate ? departmentEndDate.format('YYYY-MM-DD') : null,
        };

        dispatch(addDepartment(payload))
            .then(() => {
                notify();
                navigate('/departments');
            })
            .catch((err) => {
                toast.error('Failed to add department.');
            })
    };

    return (
        <div className="add-department-dashboard">
            <section className="add-department-head flex justify-between mb-3">
                <div className="flex items-center gap-3">
                    <FiArrowLeftCircle size={28} className="text-[#0061A1] hover:cursor-pointer"
                                       onClick={() => window.history.back()}/>
                    <div className="text-[17px]">
                        <span>Dashboard / </span>
                        <span className="font-semibold">Add Departments</span>
                    </div>
                </div>
                <button
                    className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                    onClick={handleSubmit}
                >
                    <FiEdit size={20} className="edit-icon"/>
                    <span>Save details</span>
                </button>
            </section>
            <section className="add-department-body bg-white px-10 py-7 flex flex-col gap-5 h-[525px]">
                <div className="add-department-details my-4 bg-white rounded">
                    <h3 style={{
                        fontSize: "18px",
                        marginBottom: "10px",
                        color: "#7D7D7D",
                        fontWeight: "bold"
                    }}>Department details</h3>
                    <div className="employee-details flex gap-10">
                        {/*<TextField*/}
                        {/*    label="Department Id"*/}
                        {/*    variant="outlined"*/}
                        {/*    value={departmentId}*/}
                        {/*    onChange={(e) => setDepartmentId(e.target.value)}*/}
                        {/*    name={'departmentId'}*/}
                        {/*    sx={{ width: "300px" }}*/}
                        {/*/>*/}

                        <TextField
                            label="Department Name"
                            variant="outlined"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            name={'departmentName'}
                            sx={{width: "300px"}}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Department Start Date"
                                value={departmentStartDate} // Ensure it's a dayjs object or null
                                onChange={(newDate) => handleDateChange('start', newDate)}
                                format="DD/MM/YYYY" // Optional: format displayed in the input box
                                renderInput={(params) => <TextField {...params} />}
                                sx={{width: "300px"}}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Department End Date"
                                value={departmentEndDate}
                                onChange={(newDate) => handleDateChange('end', newDate)}
                                format="DD/MM/YYYY" // Optional: format displayed in the input box
                                renderInput={(params) => <TextField {...params} />}
                                sx={{width: "300px"}}
                            />
                        </LocalizationProvider>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddDepartment;
