import React, { createContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);

    // Get user and jobProfiles from Redux store
    const reduxUser = useSelector((state) => state.auth.user);
    const jobProfiles = useSelector((state) => state.auth.jobProfiles);

    // Initialize user with roles
    const initializeUser = async (user, departmentName, role) => {
        console.log("Initializing user in UserContext!");
        console.log("User:", user);
        console.log("Department:", departmentName);
        setUser(user);
        setIsAuthenticated(true);
        setCurrentRole({ department:departmentName, designation: role });
        const currentDate = new Date();
            console.log(currentDate.toString());
        console.log(currentRole);
        // console.log('Current Role:', { department, designation: role, permissions: permission });
    };

    const updateCurrentRole = (role) => {
        setCurrentRole(role);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentRole(null);
    };

    useEffect(() => {
        if (currentRole) {
            const currentDate = new Date();
            console.log(currentDate.toString());
            console.log('Current Role:', currentRole);
            // Trigger any necessary actions when currentRole changes
        }
    }, [currentRole]);

    // useEffect to initialize user when data from Redux changes or after the page reloads
    useEffect(() => {
        // Check if reduxUser and jobProfiles are not empty before initializing
        if (reduxUser && jobProfiles.length > 0) {
            console.log("Component mounted in userContext!");
            console.log("User:", reduxUser);
            console.log("Job Profiles:", jobProfiles);

            const roles = jobProfiles.map(profile => ({
                department: profile.departmentName,
                designation: profile.designationName
            }));

            const user2 = {    
                contact: reduxUser.employeePhone,
                email: reduxUser.employeeEmail,
                id: reduxUser.employeeId,
                name: reduxUser.employeeName,
                permissions: reduxUser.employeeAccess.split(',')[3],
                roles: roles
            };

            let tempRole = user2.roles.find((role) => role.designation === "Executive");
            if(!tempRole){
                if(user2.roles.length > 0){
                    tempRole = user2.roles[0];
                }
            }

                
            
            console.log("Temp Role:", tempRole);
            console.log("User2:", user2);
            initializeUser(user2, tempRole?.department, tempRole?.designation);
        }
        
        // Cleanup logic
        return () => {
            console.log("UserContext has been unmounted.");
        };
    }, [reduxUser, jobProfiles]);  // Runs when reduxUser or jobProfiles change

    return (
        <UserContext.Provider value={{ user, isAuthenticated, currentRole, logout, initializeUser, updateCurrentRole }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
