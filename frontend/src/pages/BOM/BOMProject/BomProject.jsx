import React, { useEffect } from 'react'
import Infocard from '../../../components/Infocard/Infocard.jsx';
import "./BomProject.css"
import {FiPlusCircle} from "react-icons/fi";
import Searchbar from '../Searchbox/Searchbar.jsx';
import TableComponent from '../Table/TableComponent.jsx';
import { useDispatch,useSelector } from 'react-redux';
// import { fetchBom } from '../../../features/BOM.js';
import {
  fetchActiveProjects,
  
} from '../../../features/projectSlice.js';

const BomProject = () => {

  const dispatch =useDispatch();
//   const columns = [
//     { id: 'projectNumber', label: 'Project No.', align: 'left' },
//     { id: 'dieName', label: ' Project Name', align: 'left' },
//     { id: 'projectStatus', label: 'Status', align: 'left' },
//     { id: 'startDate', label: 'Start Date', align: 'left' },
//     { id: 'endDate', label: 'End Date', align: 'left' },
//     { id: 'detailPage', label: ' ', align: 'left' },
   
// ];


const columns = [
  {
    label: 'Project Number',
    id: 'projectNumber',
    align: 'left',
  },
  {
    label: 'Company Name',
    id: 'companyName',
    align: 'left',
  },
  {
    label: 'Die Name',
    id: 'dieName',
    align: 'left',
  },
  {
    label: 'Status',
    id: 'projectStatus',
    align: 'left',
  },
  {
    label: 'Start Date*',
    id: 'startDate',
    align: 'left',
  },
  {
    label: 'End Date*',
    id: 'endDate',
    align: 'left',
  },
  {
    label: 'Progress(%)',
    id: 'progress',
    align: 'left',
  },
];



    const project = useSelector((state)=>state.projects.activeProjects)
      const { activeProjects, status, error } = useSelector(
        (state) => state.projects
      )
    


    useEffect(()=>{
         dispatch(fetchActiveProjects());
    },[])



  
  return (
    <div className="designer-bom-dashboard">
         <div className='bom-designer-infocard-container-parent'>
                <div className='infocard-container'>
                    <Infocard
                        icon={`<FiUser />`}
                        number={20}
                        text={'All Project'}
                        className={'selected'}
                        width={200}
                    />

                </div>
                
            </div>
            <Searchbar
            //  lst={items} 
             /> {/* Updated to pass the fetched items */}
             <TableComponent  rows={activeProjects} columns={columns} linkBasePath={`/bom-project/bom`}/>
             {/* <DropDownTable rows={items} columns={columns} linkBasePath={`/inventory`}  /> */}

    </div>
  )
}


export default BomProject;