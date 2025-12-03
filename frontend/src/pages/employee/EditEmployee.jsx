import React, { useEffect, useState } from 'react';
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateEmployee } from '../..//features/employeeSlice.js';
import AddEmployeeForm from './AddEmployeeForm.jsx';
import AddEmployeeDepartment from './AddEmployeeDepartment.jsx';
import AccessTable from './AccessTable.jsx';

const EditEmployee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { employees } = useSelector((state) => state.employee);

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

    const dummy = [
        {
            "designationName": "test2",
            "designationId": 18,
            "departmentName": "ABCD",
            "departmentId": 11,
            "managerName": "Rushikesh Ghodke",
            "managerId": 71
        }
    ]

    const [employeeDesignations, setEmployeeDesignations] = useState([]);
    const [access, setAccess] = useState('');

    useEffect(() => {
        const employeeData = employees.find((item) => item.employee.customEmployeeId === id);

        if (employeeData) {
            const { employee, jobProfiles } = employeeData;

            // console.log("employee:", employee);
            // console.log("jobProfiles:", jobProfiles);

            setEmployeeInputValues({
                ...employee,
                employeeEndDate: employee.employeeEndDate || null,
            });

            setEmployeeDesignations(Array.isArray(jobProfiles) ? jobProfiles : [jobProfiles]);
            setAccess(employee.employeeAccess || '');
        } else {
            toast.error('Employee details not found in Redux store.');
        }
    }, [employees, id]);

    useEffect(() => {
        // console.log("Updated employeeInputValues:", employeeInputValues);
        // console.log("Updated jobProfiles:", employeeDesignations);
    }, [employeeInputValues]);




    const notify = () =>
        toast.success('Employee Updated Successfully!', {
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

    const handleSave = (e) => {
        e.preventDefault();

        // Create payload object
        const payload = {
            employee: {
                ...employeeInputValues,
                employeeAccess: access, // Updated access string
                employeeEndDate: employeeInputValues.employeeEndDate || null,
            },
            jobProfiles: employeeDesignations.map((designation) => ({
                designationId: designation.designationId,
                designationName: designation.designationName,
                departmentId: designation.departmentId,
                managerId: designation.managerId || null,
            })),
        };

        // Dispatch Redux action
        // console.log(payload);
        dispatch(updateEmployee({ employeeId: payload.employee.employeeId, payload }))
            .unwrap()
            .then(() => {
                notify();
                navigate('/employees');
            })
            .catch(() => {
                toast.error('Failed to update employee.');
            });
    };


    return (
        <div className="edit-employee-dashboard">
            <section className="edit-employee-head flex justify-between mb-3">
                <div className="flex items-center gap-3">
                    <FiArrowLeftCircle
                        size={28}
                        className="text-[#0061A1] hover:cursor-pointer"
                        onClick={() => window.history.back()}
                    />
                    <div className="text-[17px]">
                        <span>Dashboard / </span>
                        <span className="font-semibold">Edit Employee Details</span>
                    </div>
                </div>
                <button
                    className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                    onClick={handleSave}
                >
                    <FiEdit size={20} className="edit-icon" />
                    <span>Save changes</span>
                </button>
            </section>
            <section className="edit-employee-body bg-white px-10 py-7 flex flex-col gap-5">
                <AddEmployeeForm
                    employeeInputValues={employeeInputValues}
                    setEmployeeInputValues={setEmployeeInputValues}
                />

                <AddEmployeeDepartment
                    initialEmployeeDesignations={employeeDesignations}
                    setEmployeeDesignations={setEmployeeDesignations}
                />

                <AccessTable access={access} setAccess={setAccess} mode={"edit"} />
            </section>
            <ToastContainer />
        </div>
    );
};

export default EditEmployee;
