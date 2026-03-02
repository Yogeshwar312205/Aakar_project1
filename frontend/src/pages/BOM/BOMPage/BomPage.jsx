import "./BomPage.css"
import { FiArrowLeftCircle, FiSave } from 'react-icons/fi';
import React,{useEffect, useState} from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import AddBOM from "../AddBOM/AddBOM.jsx";
import TableComponent from '../Table/TableComponent.jsx';
import { useDispatch,useSelector } from "react-redux";
import { fetchBom } from "../../../features/BOM.js";
// import { RiH1 } from "react-icons/ri";
const BOMPage = ({ view="designer" }) => {
  const dispatch=useDispatch();
  const navigate = useNavigate();
   const [triggerEdit,setTriggerEdit ] = useState({active:false,id:null,bom:{}});

   const {projectId}=useParams();
   console.log("the project id in bom page is ",projectId);
   const bom=useSelector((state)=>state.BOM.BOMDesign);
       const project = useSelector((state)=>state.projects.activeProjects);
     const   filteredProject=project.find((eachproject)=>eachproject.projectNumber==projectId)
   console.log("bom details in page is ",bom);
   console.log("the project id in bom page is ",projectId);

   useEffect(()=>{

    console.log("use effect render ");
    dispatch(fetchBom(projectId));
    
    

   },[])

   const sortEditBOM= (triggerEdit)=>{
    const filteredBOM= bom.find((eachbom)=>eachbom.bomId===triggerEdit.id)
     setTriggerEdit((prev)=>({...prev,bom:filteredBOM}))
    console.log("filtred bom is  ",triggerEdit);
   }

   useEffect(()=>{
    if(triggerEdit.active){
      sortEditBOM(triggerEdit);
    }

   },[triggerEdit.active,triggerEdit.bom])
        
       
          
  var columns = [];

  if(view=="designer"){
    columns=[
      { id: "itemName", label: "item Name", align: "center" },
      { id: "itemCode", label: "Item Code", align: "center" },
      { id: "specification", label: "Specification", align: "center" },
      { id: "AWidth", label: "Width", align: "center" },
      { id: "AHeight", label: "Height", align: "center" },
      { id: "ALength", label: "Length", align: "center" },
      { id: "AQuantity", label: "Qunatity", align: "center" },
      { id: "editButton", label: " ", align: "center" },
      { id: "deleteButton", label: " ", align: "center" }


    ]; 
  }
  else if (view=="manufacturer"){
   columns=[ { id: "itemName", label: "item Name", align: "center"},
    { id: "itemCode", label: "Item Code", align: "center"},
    { id: "specification", label: "Specification", align: "center" },
    { id: "EWidth", label: "Width", align: "center" ,description:"AWidth"},
    { id: "EHeight", label: "Height", align: "center",description:"AHeight" },
    { id: "ELength", label: "Length", align: "center",description:"ALength" },
    { id: "EQuantity", label: "Qunatity", align: "center",description:"AQuantity" },
    { id: "editButton", label: " ", align: "center" },


   ]

  }


 

  return (
    <div className="designer-project-material-dashboard">
      <div className="header">
        <div className="back-button">
          <div>
            <FiArrowLeftCircle className="back-btn-icon" onClick={() => navigate("/bom-designer")} />
            <div className="back-btn-text">
              <span className="back-btn-text-dashboard">Inventory / </span><span>Project Material</span>
            </div>
          </div>
        </div>
      </div>
      <div className="body">
        <div className="project-matrial-details">
          <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D" }}>Item details</h3>
          <div className="project-details">
            {/* Add your item details here */}
            <div className="project-details-div">
              <div className="title">Project Nam</div>
              <div className="value">akkar</div>
            </div>
            <span className="project-details-span"></span>
            <div className="project-details-div">
              <div className="title">Specification</div>
              <div className="value">hello</div>
            </div>
            <span className="project-details-span"></span>
            <div className="project-details-div">
              <div className="title">Units</div>
              <div className="value">hello</div>
            </div>
            <span className="project-details-span"></span>
            <div className="project-details-div">
              <div className="title">Quantity</div>
              <div className="value">hello</div>
            </div>
            
          </div>

          <section>
            <div className="new-bom-add">
              <AddBOM view={view} triggerEdit={triggerEdit} setTriggerEdit={setTriggerEdit} />
              {bom ? (
                              <TableComponent rows={bom} columns={columns} setTriggerEdit={setTriggerEdit} /> 

              ):(            <h1>No Bom details Found</h1>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


export default BOMPage;
