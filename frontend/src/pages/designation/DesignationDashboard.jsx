import './DesignationDashboard.css';
import Infocard from '../../components/Infocard/Infocard.jsx';
import TableComponent from '../../components/Table/TableComponent.jsx';
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { FiPlusCircle, FiBriefcase } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {getAllEmployees} from "../..//features/employeeSlice.js";
import {fetchDesignations} from "../..//features/designationSlice.js";

const DesignationDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const access = useSelector((state) =>  state?.auth?.user?.employeeAccess).split(',')
    const HRManagementAccess = access[0];

    // Fetch working departments on component mount
    useEffect(() => {
        dispatch(getAllEmployees());
        dispatch(fetchDesignations());
    }, [dispatch]);

    // Access working departments from Redux state
    const { designations } = useSelector(state => state.designation);

    console.log(designations)

    // Populate rows from working departments
    const rows = designations.map((designation) => ({
        designId: designation.designationId,
        designName: designation.designationName,
    }));

    const columns = [
        { id: 'designName', label: 'Designation Name', align: 'left' },
    ];

    return (
        <div className='dashboard'>
            <div className='flex justify-between items-end mb-5'>
                <div className='infocard-container h-max'>
                    <Infocard
                        icon={`<FiBriefcase />`}
                        number={rows.length}
                        text={'All Designations'}
                        className={'selected'}
                    />
                </div>
                {
                    HRManagementAccess[9] &&
                    <button
                        className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
                        onClick={() => navigate('/designations/addDesignation')}>
                        <FiPlusCircle style={{marginRight: '10px', width: '25px', height: '25px'}}/>
                        Add designation
                    </button>
                }
            </div>

            <TableComponent rows={rows} columns={columns} linkBasePath={`/designation`} itemLabel={'Designations'}
                            searchLabel={'Search by designation name'} defaultSortOrder={'oldest'}/>
        </div>
    );
};

export default DesignationDashboard;
