import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeAccess, logout } from '../features/authSlice';
import { toast } from 'react-toastify';

/**
 * Custom hook to sync employee access permissions in real-time
 * Checks for access changes every 10 seconds and updates Redux/localStorage
 * Also handles account deactivation by logging out the user
 * 
 * NOTE: This hook should be used inside a Router context (after <Router> component)
 */
export const useAccessSync = (navigate) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const lastAccessRef = useRef(user?.employeeAccess);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Only sync if user is authenticated
        if (!isAuthenticated || !user?.employeeId) {
            return;
        }

        // Function to check access updates
        const checkAccess = async () => {
            try {
                const result = await dispatch(fetchEmployeeAccess(user.employeeId)).unwrap();
                
                // Check if account was deactivated
                if (result.deactivated) {
                    toast.error('Your account has been deactivated. Please contact HR.', {
                        autoClose: 5000,
                    });
                    dispatch(logout());
                    if (navigate) {
                        navigate('/login');
                    } else {
                        window.location.href = '/login';
                    }
                    return;
                }

                // Check if access permissions changed
                if (result.employeeAccess !== lastAccessRef.current) {
                    console.log('🔄 Access permissions updated');
                    lastAccessRef.current = result.employeeAccess;
                    
                    // Show notification to user
                    toast.info('Your access permissions have been updated.', {
                        autoClose: 4000,
                    });
                }
            } catch (error) {
                // If account is deactivated or access denied
                if (error.message === 'Account has been deactivated') {
                    toast.error('Your account has been deactivated. Please contact HR.', {
                        autoClose: 5000,
                    });
                    dispatch(logout());
                    if (navigate) {
                        navigate('/login');
                    } else {
                        window.location.href = '/login';
                    }
                }
            }
        };

        // Initial check
        checkAccess();

        // Set up polling every 10 seconds
        intervalRef.current = setInterval(checkAccess, 10000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [dispatch, navigate, isAuthenticated, user?.employeeId]);

    return null;
};
