import React, { useEffect, useState } from 'react';
import GeneralSearchBar from '../components/GenralSearchBar.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { skillTrainingByDepartment } from './Manager/UpdateSkillAPI.jsx';
import { setSelectedDepartmentId, setSelectedDepartmentName } from '../features/departmentSlice.js';

const Home = () => {
    const employeeMail = useSelector((state) => state.auth.user?.employeeEmail);
    const [allDept, setAllDept] = useState([]);
    const [objectDepartmentId, setObjectDepartmentID] = useState({});
    const predepartmentId = useSelector((state) => state.auth.user?.departmentId);
    const [departmentId, setDepartmentId] = useState(predepartmentId);
    const selectedDepartmentId = useSelector((state) => state.department.selectedDepartmentId);
    const departmentName = useSelector((state) => state.auth.user?.departmentName);
    const selectedDepartmentName = useSelector((state) => state.department.selectedDepartmentName);
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    // Fetch departments when the component mounts
    useEffect(() => {
        let isMounted = true; // Flag to track if the component is mounted
        
        console.log('Redux State:', state);
        const fetchDepartments = async () => {
            try {
                const response = await skillTrainingByDepartment();
                if (isMounted) {
                    console.log("Response Data:", response);
                    setAllDept(response);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching departments:", error);
                }
            }
        };

        fetchDepartments();

        return () => {
            isMounted = false; // Cleanup function to mark the component as unmounted
        };
    }, []);

    // Update the selected department object when `selectedDepartmentId` changes
    useEffect(() => {
        if (selectedDepartmentId) {
            const selectedDept = allDept.find(dept => dept.departmentId === selectedDepartmentId);
            if (selectedDept) {
                setObjectDepartmentID(selectedDept);
            }

            
        }
    }, [selectedDepartmentId, allDept]);

    // Handle department selection
    const handleDeptSelect = (selectedDept) => {
        console.log("Selected Department:", selectedDept);
        setObjectDepartmentID(selectedDept);
        setDepartmentId(selectedDept.departmentId);
        dispatch(setSelectedDepartmentId(selectedDept.departmentId));
        dispatch(setSelectedDepartmentName(selectedDept.departmentName));
    };

    return (
        <>
            <div>Welcome to the ERP Dashboard!</div>

            <h2 className='update-skill-dept-name'>
                Department: {departmentName || selectedDepartmentName || '-'}
            </h2>

            <div className='mt-5'>
                {employeeMail === 'admin@gmail.com' && (
                    <GeneralSearchBar
                        label='Search Department'
                        options={allDept}
                        displayKey="departmentName"
                        selectedValues={objectDepartmentId}
                        setSelectedValues={handleDeptSelect}
                        placeholder='Department'
                    />
                )}
            </div>
        </>
    );
};

export default Home;    