import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { FiArrowLeftCircle, FiEdit } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { deleteEmployee, getAllEmployees } from "../..//features/employeeSlice.js"; // Import deleteEmployee action
import TableComponent from "../../components/Table/TableComponent.jsx";
import AccessTableOutput from "./AccessTableOutput.jsx";
import { MdAutoDelete } from "react-icons/md";
import './EmployeeDashboard.css';
import {Bounce, toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AccessDisplay from "./AccessDisplay.jsx";
import { getHRManagementAccess } from '../../utils/hrAccess.js';
import { BASE_URL } from '../../constants.js';

function EmployeeProfile() {
    const { id } = useParams();
    console.log('🔵 EmployeeProfile loaded for employee ID:', id);
    const dispatch = useDispatch(); // Use dispatch hook to dispatch actions
    const navigate = useNavigate(); // Move this to the top with other hooks
    const allEmployeesData = useSelector((state) => state?.employee); // Fetch employees from Redux store
    const employeesData = allEmployeesData.employees;
    const employeeAccess = useSelector((state) => state?.auth?.user?.employeeAccess) || '';
    const hrAccess = getHRManagementAccess(employeeAccess);
    const [employeeProjects, setEmployeeProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    console.log(allEmployeesData)

    // Fetch all employees if not loaded
    useEffect(() => {
        if (!employeesData || employeesData.length === 0) {
            console.log('Fetching all employees...');
            dispatch(getAllEmployees());
        }
    }, [dispatch, employeesData]);

    // Function to find an employee by customEmployeeId
    const findEmployeeById = (customEmployeeId) => {
        return employeesData.find(employee => employee.employee.customEmployeeId === customEmployeeId);
    };

    // Fetch employee projects
    useEffect(() => {
        const fetchEmployeeProjects = async () => {
            if (!id) {
                console.log('No employee ID provided');
                setLoadingProjects(false);
                return;
            }
            
            console.log('Fetching projects for employee:', id);
            setLoadingProjects(true);
            try {
                const url = `${BASE_URL}/api/projects/employee/${id}`;
                console.log('Fetching from URL:', url);
                
                const response = await fetch(url, {
                    credentials: 'include', // This sends cookies
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Received projects data:', data);
                    setEmployeeProjects(data.data || []);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch employee projects. Status:', response.status, 'Error:', errorText);
                    setEmployeeProjects([]);
                }
            } catch (error) {
                console.error('Error fetching employee projects:', error);
                setEmployeeProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchEmployeeProjects();
    }, [id]);

    // Check if employeesData is still loading
    if (allEmployeesData.loading) {
        return <div>Loading employee data...</div>;
    }

    if (!employeesData || employeesData.length === 0) {
        return <div>Loading employees...</div>;
    }

    const employee = findEmployeeById(id);
    if (!employee) {
        return <div>Employee not found.</div>;
    }

    // Handle Delete Employee
    const handleDelete = () => {
        console.log("Are you sure you want to delete this employee?", employee.employee.employeeId)
        const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
        if (confirmDelete) {
            dispatch(deleteEmployee(employee.employee.employeeId))
                .unwrap()
                .then(() => {
                    notify();
                    navigate("/employees");
                })
                .catch((errorMessage) => {
                    toast.error(errorMessage || 'Failed to delete employee.');
                });
        }
    };

    const handleEdit = () => {
        navigate(`/employee/edit/${id}`);
    }

    const notify = () => toast.success('Employee Deleted Successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });

    const columns = [
        { id: 'companyName', label: 'Company Name', align: 'left' },
        { id: 'projectNumber', label: 'Project Number', align: 'center' },
        { id: 'dieName', label: 'Die Name', align: 'left' },
        { id: 'startDate', label: 'Start Date', align: 'center' },
        { id: 'endDate', label: 'End Date', align: 'center' },
        { id: 'progress', label: 'Progress', align: 'center' },
        { id: 'projectStatus', label: 'Status', align: 'center' },
    ];

    const designationColumns = [
        { id: 'designation', label: 'Designation', align: 'left' },
        { id: 'department', label: 'Department', align: 'left' },
        { id: 'manager', label: 'Reporting Authority', align: 'left' },
    ];

    const designationRows = employee.jobProfiles.map((jobProfile, index) => ({
        id: index + 1,
        designation: jobProfile.designationName || 'N/A',
        department: jobProfile.departmentName || 'N/A',
        manager: jobProfile.managerName || 'N/A',
    }));

    // Map project data to table rows
    const projectRows = employeeProjects.map((project, index) => ({
        id: index + 1,
        companyName: project.companyName || 'N/A',
        projectNumber: project.projectNumber || 'N/A',
        dieName: project.dieName || 'N/A',
        startDate: project.startDate || 'N/A',
        endDate: project.endDate || 'N/A',
        progress: `${project.progress || 0}%`,
        projectStatus: project.projectStatus || 'N/A',
    }));

    return (
        <div>
            <div className="add-employee-dashboard">
                <section className="add-employee-head flex justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <FiArrowLeftCircle size={28} className="text-[#0061A1]" onClick={() => window.history.back()} />
                        <div className="text-[17px]">
                            <span>Dashboard / </span>
                            <span className="font-semibold">Employee Details</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {hrAccess.employee.update && (
                            <button
                                onClick={handleEdit}
                                className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded">
                                <FiEdit size={20} className="save-icon"/>
                                <span>Edit details</span>
                            </button>
                        )}
                        {hrAccess.employee.delete && (
                            <button
                                className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
                                onClick={handleDelete}>
                                <MdAutoDelete size={20} className="delete-icon"/>
                                <span>Delete Employee</span>
                            </button>
                        )}
                    </div>
                </section>

                <section className="add-employee-body bg-white px-10 py-7 rounded">
                    <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>
                        Personal details
                    </h3>
                    <div className="border-[#C3C3C3] border-2 flex flex-row items-center justify-between p-6 rounded-xl mb-10">
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">Name</span>
                            <span className="text-black text-lg font-semibold">{employee.employee.employeeName}</span>
                        </div>
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">ID</span>
                            <span className="text-black text-lg font-semibold">{employee.employee.customEmployeeId}</span>
                        </div>
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">Department</span>
                            <span className="text-black text-lg font-semibold">{employee.jobProfiles[0]?.departmentName || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">Experience</span>
                            <span className="text-black text-lg font-semibold">{employee.employee.experienceInYears} Years</span>
                        </div>
                        <div className="flex flex-col w-max">
                            <span className="text-[#585858] text-[16px]">Role</span>
                            <span className="text-black text-lg font-semibold">{employee.jobProfiles[0]?.designationName || 'N/A'}</span>
                        </div>
                    </div>
                    <AccessDisplay accessString={employee.employee.employeeAccess} />
                </section>

                <section className="add-employee-body bg-white px-10 py-1 rounded">
                    <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>
                        Designations
                    </h3>
                    <TableComponent columns={designationColumns} rows={designationRows} searchLabel={'Search by designation name'} />
                </section>

                <section className="add-employee-body bg-white px-10 py-10 rounded">
                    <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D", fontWeight: "bold" }}>
                        Projects {loadingProjects && <span style={{ fontSize: "14px", color: "#999" }}>(Loading...)</span>}
                        {!loadingProjects && employeeProjects.length > 0 && (
                            <span style={{ fontSize: "14px", color: "#0061A1", marginLeft: "8px" }}>
                                ({employeeProjects.length} project{employeeProjects.length !== 1 ? 's' : ''})
                            </span>
                        )}
                    </h3>
                    {!loadingProjects && employeeProjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '15px' }}>
                            This employee is not assigned to any projects yet.
                        </div>
                    ) : (
                        <TableComponent columns={columns} rows={projectRows} searchLabel={'Search by project name or number'}/>
                    )}
                </section>
            </div>
            <ToastContainer />
        </div>
    );
}

export default EmployeeProfile;
