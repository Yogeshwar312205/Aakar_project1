import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {getAllEmployees} from '../..//features/employeeSlice.js';
import {FiPlusCircle} from 'react-icons/fi';
import Infocard from "../../components/Infocard/Infocard.jsx";
import TableComponent from "../../components/Table/TableComponent.jsx";

const EmployeeList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {employees, loading, error} = useSelector((state) => state.employee);

    const access = useSelector((state) => state?.auth?.user?.employeeAccess).split(',')
    const HRManagementAccess = access[0];
    console.log(HRManagementAccess);
    const [rows, setRows] = useState([]);
    const columns = [
        {id: 'empId', label: 'Employee ID', align: 'left'},
        {id: 'empName', label: 'Name', align: 'left'},
        {id: 'empEmail', label: 'Email ID', align: 'left'},
        {id: 'empJobTitle', label: 'Role', align: 'left'},
        {id: 'empDept', label: 'Department', align: 'left'},
    ];

    useEffect(() => {
        // console.log("Getting Employee Details")
        dispatch(getAllEmployees());
    }, [dispatch]);


    useEffect(() => {
        // console.log(employees)
        if (employees) {

            const processedRows = employees.map((data, index) => {
                const {employee, jobProfiles} = data;

                // Extract and join job profile details
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
            // console.log(processedRows)
            setRows(processedRows);
        }
    }, [employees]);

    // console.log(rows)

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
                {
                    HRManagementAccess[1] === '1' && <button
                        className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
                        onClick={() => navigate('/employee/addEmployee')}>
                        <FiPlusCircle style={{marginRight: '10px', width: '25px', height: '25px'}}/>
                        Add employee
                    </button>
                }
            </div>

            <div className='employee-list-container'>
                <div className='flex items-center justify-between'>
                    {/*<Searchbar*/}
                    {/*    items={rows}*/}
                    {/*    itemKey="empId" // Assuming each employee has an empId as a unique key*/}
                    {/*    itemLabel="empName" // Name to search by*/}
                    {/*    navigateTo="/employee"*/}
                    {/*/>*/}
                </div>

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
        </div>
    );
};

export default EmployeeList;
