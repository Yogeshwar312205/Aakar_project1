import React, { useState } from 'react';
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addEmployee } from '../..//features/employeeSlice.js'; // Redux action
import AddEmployeeForm from './AddEmployeeForm.jsx';
import AddEmployeeDepartment from './AddEmployeeDepartment.jsx';
import AccessTable from './AccessTable.jsx';

const AddEmployee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const [employeeInputValues, setEmployeeInputValues] = useState({
        customEmployeeId: '',
        employeeName: '',
        companyName: '',
        employeeQualification: '',
        experienceInYears: 0,
        employeeDOB: null,
        employeeAge: 0,
        employeeJoinDate: null,
        employeeGender: '',
        employeePhone: '',
        employeeEmail: '',
        employeePassword: '',
    });

    const [employeeDesignations, setEmployeeDesignations] = useState([
        {
            designationId: 0,
            designationName: '',
            departmentId: 0,
            managerId: 0,
        },
    ]);

    const [access, setAccess] = useState('');

    const handleSave = (e) => {
        e.preventDefault();

        // Structure the payload
        const payload = {
            employee: {
                ...employeeInputValues,
                employeeAccess: access,
                employeeEndDate: employeeInputValues.employeeEndDate || null,
            },
            jobProfiles: employeeDesignations.map((designation) => ({
                designationId: designation.designationId,
                designationName: designation.designationName,
                departmentId: designation.departmentId,
                managerId: designation.managerId || null,
            })),
        };

        console.log(payload);
        // Dispatching the payload to the Redux action
        dispatch(addEmployee(payload))
            .then(() => {
                notify();
                navigate('/employees');
            })
            .catch(() => {
                toast.error('Failed to add employee.');
            });
    };

    return (
        <div className="add-employee-dashboard">
            <section className="add-employee-head flex justify-between mb-3">
                <div className="flex items-center gap-3">
                    <FiArrowLeftCircle
                        size={28}
                        className="text-[#0061A1] hover:cursor-pointer"
                        onClick={() => window.history.back()}
                    />
                    <div className="text-[17px]">
                        <span>Dashboard / </span>
                        <span className="font-semibold">Employee Details</span>
                    </div>
                </div>
                <button
                    className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                    onClick={handleSave}
                >
                    <FiEdit size={20} className="edit-icon" />
                    <span>Save details</span>
                </button>
            </section>
            <section className="add-employee-body bg-white px-10 py-7 flex flex-col gap-5">
                <AddEmployeeForm
                    employeeInputValues={employeeInputValues}
                    setEmployeeInputValues={setEmployeeInputValues}
                />
                <AddEmployeeDepartment
                    employeeDesignations={employeeDesignations}
                    setEmployeeDesignations={setEmployeeDesignations}
                />
                <AccessTable access={access} setAccess={setAccess} />
            </section>
        </div>
    );
};

export default AddEmployee;