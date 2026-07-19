import React, { useEffect, useState } from 'react';
import GeneralSearchBar from '../components/GenralSearchBar.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { skillTrainingByDepartment } from './Manager/UpdateSkillAPI.jsx';
import { setSelectedDepartmentId, setSelectedDepartmentName } from '../features/departmentSlice.js';
import './Home.css';

const Home = () => {
    const employeeMail = useSelector((state) => state.auth.user?.employeeEmail);
    const userName = useSelector((state) => state.auth.user?.employeeName || 'User');
    const userRole = useSelector((state) => state.auth.user?.designationName || 'Employee');
    const [allDept, setAllDept] = useState([]);
    const [objectDepartmentId, setObjectDepartmentID] = useState({});
    const predepartmentId = useSelector((state) => state.auth.user?.departmentId);
    const [departmentId, setDepartmentId] = useState(predepartmentId);
    const selectedDepartmentId = useSelector((state) => state.department.selectedDepartmentId);
    const departmentName = useSelector((state) => state.auth.user?.departmentName);
    const selectedDepartmentName = useSelector((state) => state.department.selectedDepartmentName);
    const dispatch = useDispatch();
    
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch departments when the component mounts
    useEffect(() => {
        let isMounted = true;
        
        const fetchDepartments = async () => {
            try {
                const response = await skillTrainingByDepartment();
                if (isMounted) {
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
            isMounted = false;
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
        setObjectDepartmentID(selectedDept);
        setDepartmentId(selectedDept.departmentId);
        dispatch(setSelectedDepartmentId(selectedDept.departmentId));
        dispatch(setSelectedDepartmentName(selectedDept.departmentName));
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="greeting-section">
                        <h1 className="greeting-text">{getGreeting()}, {userName}!</h1>
                        <p className="role-text">{userRole} · {departmentName || selectedDepartmentName || 'Aakar ERP'}</p>
                    </div>
                    <div className="date-time-section">
                        <div className="current-date">
                            {currentTime.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                        <div className="current-time">
                            {currentTime.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Selector for Admin */}
            {employeeMail === 'admin@gmail.com' && (
                <div className="admin-section">
                    <div className="section-header">
                        <h2>Department Selection</h2>
                        <p>Select a department to view specific information</p>
                    </div>
                    <div className="department-selector">
                        <GeneralSearchBar
                            label='Search Department'
                            options={allDept}
                            displayKey="departmentName"
                            selectedValues={objectDepartmentId}
                            setSelectedValues={handleDeptSelect}
                            placeholder='Select Department'
                        />
                    </div>
                </div>
            )}

            {/* Welcome Message */}
            <div className="welcome-section">
                <h2>Welcome to Aakar ERP</h2>
                <p>Use the navigation menu to access different modules and manage your work efficiently.</p>
            </div>
        </div>
    );
};

export default Home;
