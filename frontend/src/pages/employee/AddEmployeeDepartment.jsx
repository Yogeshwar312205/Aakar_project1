import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { MdOutlineDelete } from "react-icons/md";
import { Autocomplete, TextField, FormControl } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDepartments, fetchAllWorkingDepartments } from "../../features/departmentSlice.js";
import { fetchDesignations } from "../../features/designationSlice.js";
import { getAllEmployees } from "../../features/employeeSlice.js";

const AddEmployeeDepartment = ({ employeeDesignations: initialEmployeeDesignations = [], setEmployeeDesignations }) => {
    const [employeeDesignations, setLocalEmployeeDesignations] = useState(initialEmployeeDesignations || []);

    console.log(employeeDesignations);

    const dispatch = useDispatch();

    // Fetch data from Redux store
    const { employees } = useSelector((state) => state.employee);
    const { departments } = useSelector((state) => state.department);
    const { designations, loading: designationsLoading, error: designationsError } = useSelector((state) => state.designation);

    useEffect(() => {
        setLocalEmployeeDesignations(initialEmployeeDesignations || []);
    }, [initialEmployeeDesignations]);

    useEffect(() => {
        console.log(employees);
    }, [employees]);

    // Dispatch actions on component mount
    useEffect(() => {
        dispatch(fetchAllWorkingDepartments());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchDesignations());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getAllEmployees());
    }, [dispatch]);

    const empData = employees.map((employee) => ({
        value: employee?.employee?.employeeId || '',
        label: employee?.employee?.employeeName || '',
    }));

    console.log(departments);
    const deptData = (departments.working || []).map((department) => ({
        value: department.departmentId,
        label: department.departmentName,
    }));

    const desgData = designations.map((designation) => ({
        value: designation.designationId,
        label: designation.designationName
    }));

    const isValidDesignation = (designationName) => {
        return desgData.some(desg => desg.label.toLowerCase() === designationName.toLowerCase());
    };

    const handleAddDesignation = () => {
        const newDesignation = {
            customEmployeeId: "",
            departmentId: "",
            designationId: null,
            designationName: "",
            managerId: "",
        };

        const updatedDesignations = [...employeeDesignations, newDesignation];
        setLocalEmployeeDesignations(updatedDesignations);
        setEmployeeDesignations(updatedDesignations);
    };

    const handleDeleteDesignation = (index) => {
        // Create new array without the item at index
        const updatedDesignations = employeeDesignations.filter((_, i) => i !== index);
        setLocalEmployeeDesignations(updatedDesignations);
        setEmployeeDesignations(updatedDesignations);
    };

    const handleAutocompleteChange = (event, newValue, name, index) => {
        // Prevent empty departmentId and managerId
        if ((name === 'departmentId' || name === 'managerId') && !newValue) {
            return;
        }

        // Create a deep copy with the updated value - preserve all original properties
        const updatedDesignations = employeeDesignations.map((designation, i) => {
            if (i === index) {
                // Create new object preserving all properties
                return {
                    ...designation,
                    [name]: newValue || ''
                };
            }
            // Return original object for other indices (no need to copy)
            return designation;
        });
        
        setLocalEmployeeDesignations(updatedDesignations);
        setEmployeeDesignations(updatedDesignations);
    };

    const handleDesignationNameChange = (event, newInputValue, index) => {
        // Create a deep copy by mapping through and creating new objects
        const updatedDesignations = employeeDesignations.map((designation, i) => {
            if (i === index) {
                const updated = { ...designation, designationName: newInputValue };
                
                // Check if designationName is valid
                if (!isValidDesignation(newInputValue)) {
                    updated.designationId = 0;
                } else {
                    updated.designationId = null;
                }
                
                return updated;
            }
            // Return original object for other indices
            return designation;
        });

        setLocalEmployeeDesignations(updatedDesignations);
        setEmployeeDesignations(updatedDesignations);
    };

    return (
        <div>
            <div className="add-employee-department flex mt-8 bg-white rounded items-center justify-between">
                <p style={{ fontSize: "18px", color: "#7D7D7D", fontWeight: "bold", margin: 0, paddingRight: 50 }}>Employee Designation</p>
                <button className="flex gap-3 justify-between items-center text-[#0061A1] border-2 border-[#0061A1] font-semibold px-2 py-1 rounded" onClick={handleAddDesignation}>
                    <FiPlusCircle />
                    <span>Add Designation</span>
                </button>
            </div>
            <div className={`bg-white mt-3`}>
                <div className={`flex flex-col gap-5 mb-8 border-2 border-gray-300 rounded`}>
                    {employeeDesignations.length > 0 ? (
                        employeeDesignations.map((designation, index) => (
                            <div key={index}>
                                <div className={`flex flex-row gap-8`}>
                                    <FormControl sx={{ width: 300 }}>
                                        <Autocomplete
                                            options={deptData}
                                            getOptionLabel={(option) => option.label || ""}
                                            value={deptData.find(dept => dept.value === designation.departmentId) || null}
                                            onChange={(event, newValue) => handleAutocompleteChange(event, newValue ? newValue.value : '', 'departmentId', index)}
                                            renderInput={(params) => <TextField {...params} label="Department" placeholder="Select Department" />}
                                            freeSolo
                                        />
                                    </FormControl>

                                    <FormControl sx={{ width: 300 }}>
                                        <Autocomplete
                                            options={desgData}
                                            getOptionLabel={(option) => option.label || ""}
                                            value={desgData.find(des => des.value === designation.designationId) || null}
                                            onChange={(event, newValue) => {
                                                handleAutocompleteChange(event, newValue ? newValue.value : null, 'designationId', index);
                                                if (newValue) {
                                                    // Create a deep copy and clear designationName
                                                    const updatedDesignations = employeeDesignations.map((designation, i) => {
                                                        if (i === index) {
                                                            return { ...designation, designationName: '' };
                                                        }
                                                        return designation;
                                                    });
                                                    setLocalEmployeeDesignations(updatedDesignations);
                                                }
                                            }}
                                            onInputChange={(event, newInputValue) => handleDesignationNameChange(event, newInputValue, index)}
                                            renderInput={(params) => <TextField {...params} label="Designation" placeholder="Select Designation or type" />}
                                            freeSolo
                                        />
                                    </FormControl>

                                    <FormControl sx={{ width: 300 }}>
                                        <Autocomplete
                                            options={empData}
                                            getOptionLabel={(option) => option.label || ""}
                                            value={empData.find(emp => emp.value === designation.managerId) || null}
                                            onChange={(event, newValue) => handleAutocompleteChange(event, newValue ? newValue.value : '', 'managerId', index)}
                                            renderInput={(params) => <TextField {...params} label="Reporting Authority" placeholder="Select Reporting Authority" />}
                                            freeSolo
                                        />
                                    </FormControl>

                                    <button className="delete-btn" onClick={() => handleDeleteDesignation(index)}>
                                        <MdOutlineDelete className={`text-2xl`} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={`rounded ml-2 p-4 text-[#7D7D7D]`}>No designations added!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeDepartment;
