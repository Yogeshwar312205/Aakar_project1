import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllEmployees } from '../../features/employeeSlice.js';
import { FiPlusCircle } from 'react-icons/fi';
import Infocard from "../../components/Infocard/Infocard.jsx";
import TableComponent from "../../components/Table/TableComponent.jsx";
import { FaFileImport } from "react-icons/fa";
import Modal from "react-modal";
import {BarLoader, RingLoader} from 'react-spinners'; // Use a spinner component
import { IP } from '../../constants.js';

const EmployeeList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { employees, loading, error } = useSelector((state) => state.employee);

    const access = useSelector((state) => state?.auth?.user?.employeeAccess).split(',');
    const HRManagementAccess = access[0];

    const [rows, setRows] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // Loading state for the import process
    const [importError, setImportError] = useState(null); // To store errors from the API

    const columns = [
        { id: 'empId', label: 'Employee ID', align: 'left' },
        { id: 'empName', label: 'Name', align: 'left' },
        { id: 'empEmail', label: 'Email ID', align: 'left' },
        { id: 'empJobTitle', label: 'Role', align: 'left' },
        { id: 'empDept', label: 'Department', align: 'left' },
    ];

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setImportError(null); // Reset errors when closing the modal
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }

        setIsUploading(true); // Set loading state to true
        setImportError(null); // Clear any previous errors

        const formData = new FormData();
        formData.append('employeeExcel', selectedFile);

        try {
            const response = await fetch(`http://${IP}:3000/api/v1/employee/importEmployees`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert('Data imported successfully!');
                setIsModalOpen(false); // Close modal on success
            } else {
                // Handle errors from the API
                setImportError(data.errors);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            alert('An error occurred while importing the data');
        } finally {
            setIsUploading(false); // Set loading state to false after the request
        }
    };

    useEffect(() => {
        // Set up the app element for the modal to remove the accessibility warning
        Modal.setAppElement('#root'); // Replace '#root' with your app's root element id if different

        dispatch(getAllEmployees());
    }, [dispatch]);

    useEffect(() => {
        if (employees) {
            const processedRows = employees.map((data, index) => {
                const { employee, jobProfiles } = data;

                const roles = jobProfiles.map((profile) => profile.designationName || "N/A").join(", ");
                const departments = jobProfiles.map((profile) => profile.departmentName || "N/A").join(", ");

                return {
                    id: index + 1, // Row ID
                    empId: employee?.customEmployeeId,
                    empName: employee?.employeeName,
                    empEmail: employee?.employeeEmail,
                    empJobTitle: roles || "N/A",
                    empDept: departments || "N/A",
                    createdAt: employee?.createdAt,
                };
            });
            setRows(processedRows);
        }
    }, [employees]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='dashboard'>
            <div className='flex justify-between items-end mb-3'>
                <div className='infocard-container h-max'>
                    <Infocard
                        icon={`<FiUser />`}
                        number={rows.length}
                        text={'All Employees'}
                        className={'selected'}
                    />
                </div>

                <div className={`flex gap-3`}>
                    <button onClick={openModal} className={`flex border-2 border-[#0061A1] rounded items-center text-[#0061A1] font-semibold p-3 gap-2 hover:cursor-pointer`}>
                        <FaFileImport size={20} />
                        Import
                    </button>

                    {
                        HRManagementAccess[1] === '1' && <button
                            className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
                            onClick={() => navigate('/employee/addEmployee')}>
                            <FiPlusCircle style={{ marginRight: '10px', width: '25px', height: '25px' }} />
                            Add employee
                        </button>
                    }
                </div>
            </div>

            <div className='employee-list-container'>
                <TableComponent
                    rows={rows}
                    columns={columns}
                    linkBasePath="/employee"
                    defaultSortOrder={"oldest"}
                    itemKey="empId"
                    itemLabel="empName"
                    navigateTo="/employee"
                    searchLabel="Search by Employee Name"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Import Data Modal"
                className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-xl font-semibold mb-4">Import Data</h2>

                <div>
                    <form>
                        <input
                            type="file"
                            className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600"
                            onChange={handleFileChange}
                        />
                    </form>
                </div>

                {isUploading && (
                    <div className="flex justify-center mt-4">
                        <BarLoader color="#0061A1" loading={isUploading} size={50} />
                    </div>
                )}

                {importError && (
                    <div className="mt-4 text-red-500">
                        <h3 className="font-semibold">Import Errors:</h3>
                        <ul>
                            {importError.map((error, index) => (
                                <li key={index}>
                                    <strong>{error.row.employeeName}:</strong> {error.error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={handleImport}
                        className="bg-[#0061A1] text-white px-4 py-2 rounded"
                        disabled={isUploading}
                    >
                        Import
                    </button>
                    <button
                        onClick={closeModal}
                        className="bg-white text-[#0061A1] border-2 border-[#0061A1] px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeList;
