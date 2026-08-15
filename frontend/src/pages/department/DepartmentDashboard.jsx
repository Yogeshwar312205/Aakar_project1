import './DepartmentDashboard.css';
import Infocard from '../../components/Infocard/Infocard.jsx';
import TableComponent from '../../components/Table/TableComponent.jsx';
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { fetchAllDepartments } from "../../features/departmentSlice.js";
import { FiPlusCircle, FiBriefcase } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {getAllEmployees} from "../../features/employeeSlice.js";
import { getHRManagementAccess } from '../../utils/hrAccess.js';

const DepartmentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const employeeAccess = useSelector((state) => state?.auth?.user?.employeeAccess) || '';
    const hrAccess = getHRManagementAccess(employeeAccess);

    // Fetch all departments on component mount
    useEffect(() => {
        dispatch(getAllEmployees());
        dispatch(fetchAllDepartments());
    }, [dispatch]);

    // Access all departments from Redux state
    const { departments } = useSelector(state => state.department);

    // Debug logging
    console.log('📋 All departments from Redux:', departments.all);
    console.log('📋 Total departments:', departments.all.length);

    // Filter out closed departments (only show departments where departmentEndDate is NULL)
    // When a department is deleted, departmentEndDate is set to today's date, so it will be filtered out
    const activeDepartments = departments.all.filter(dept => 
        dept.departmentEndDate === null || dept.departmentEndDate === undefined
    );

    console.log('✅ Active departments (after filter):', activeDepartments);
    console.log('✅ Total active departments:', activeDepartments.length);

    // Populate rows from active departments only
    const rows = activeDepartments.map((department) => {
        const date = department.departmentStartDate ? new Date(department.departmentStartDate) : null;
        const formattedStartDate = date && !Number.isNaN(date.getTime())
            ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
            : '-';

        return {
            deptId: department.departmentId,
            deptName: department.departmentName,
            deptStartDate: formattedStartDate,
        };
    });


    const columns = [
        { id: 'deptName', label: 'Department Name', align: 'left' },
        { id: 'deptStartDate', label: 'Start Date', align: 'left' },
    ];

    return (
        <div className='dashboard'>
            <div className='flex justify-between items-end mb-5'>
                <div className='infocard-container h-max'>
                    <Infocard
                        icon={`<FiBriefcase />`}
                        number={rows.length}
                        text={'All Departments'}
                        className={'selected'}
                    />
                </div>
                {hrAccess.department.add && (
                    <button
                        className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
                        onClick={() => navigate('/department/addDepartment')}>
                        <FiPlusCircle style={{marginRight: '10px', width: '25px', height: '25px'}}/>
                        Add department
                    </button>
                )}
            </div>

            {/* Table Component */}
            <TableComponent rows={rows} columns={columns} linkBasePath={`/department`} itemLabel={'Department'} searchLabel={'Search by department name'} defaultSortOrder={'oldest'}/>
        </div>
    );
};

export default DepartmentDashboard;
