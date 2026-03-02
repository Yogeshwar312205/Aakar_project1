import React, {useState} from 'react';
import {FiArrowLeftCircle, FiEdit} from 'react-icons/fi';
import './AddDesignation.css';
import TextField from '@mui/material/TextField';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {useDispatch} from "react-redux";
import {addDepartment} from "../..//features/departmentSlice.js";
import {Bounce, toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {addDesignation} from "../../features/designationSlice.js";
import {notify} from "../../components/Toast/SuccessNotify.js";

const AddDesignation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [designationName, setDesignationName] = useState('');

    const handleSubmit = () => {
        dispatch(addDesignation(designationName))
            .unwrap()
            .then(() => {
                notify("Designation added successfully!");
                navigate('/designations');
            })
            .catch((err) => {
                toast.error('Failed to add designation.');
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
                        <span className="font-semibold">Add Designation</span>
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
                        <TextField
                            label="Designation Name"
                            variant="outlined"
                            value={designationName}
                            onChange={(e) => setDesignationName(e.target.value)}
                            name={'designationName'}
                            sx={{width: "300px"}}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AddDesignation;
