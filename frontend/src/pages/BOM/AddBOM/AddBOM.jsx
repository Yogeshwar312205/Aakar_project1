import React,{useEffect, useState} from 'react'
import "./AddBOM.css"
import { FiArrowLeftCircle, FiSave, FiPlusCircle } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useDispatch,useSelector } from 'react-redux';
import { updateBomDesign,fetchBom ,addBomDesign} from '../../../features/BOM.js';
import { useParams } from 'react-router-dom';

const AddBOM = ({view,triggerEdit,setTriggerEdit}) => {
  const{projectId}=useParams();
  const dispatch = useDispatch();
     const [addBOM,setAddBOM] = useState(false);

      console.log("item to be edited is ",triggerEdit.bom);

     var defaultVal={};
     if(view==="designer"){
       defaultVal={
        itemName: "",
        itemCode:"",
        specification: '',
        ALength: '',
        AHeight: '',
        AWidth: '',
        AQuantity:""
       }
     }
     else if(view==="manufacturer"){
      defaultVal={
        ELength:"",
        EHeight:"",
        EWidth:"",
        EQuantity:""
 
      }
     }


    const { control, handleSubmit, setValue, reset,getValues,isFieldActive, formState: { errors } } = useForm({
         defaultValues: defaultVal
       });
         

       useEffect(()=>{
      
         if(triggerEdit.active && view==="designer"){
          setAddBOM(true);
          setValue('itemCode', triggerEdit.bom.itemCode);
          setValue('itemName', triggerEdit.bom.itemName);
          setValue('specification', triggerEdit.bom.specification);
          setValue('ALength', triggerEdit.bom.ALength);
          setValue('AHeight', triggerEdit.bom.AHeight);
          setValue('AWidth', triggerEdit.bom.AWidth);
          setValue('AQuantity', triggerEdit.bom.AQuantity);
          
           
        }
        else if(triggerEdit.active && view==="manufacturer"){
          setAddBOM(true);

          setValue('ELength', triggerEdit.bom.ELength);
          setValue('EHeight', triggerEdit.bom.EHeight);
          setValue('EWidth', triggerEdit.bom.EWidth);
          setValue('EQuantity', triggerEdit.bom.EQuantity);
        }
      
       },[triggerEdit,triggerEdit.bom,triggerEdit.id,triggerEdit.active])
       const fields = view === "designer"
  ? [
      { name: "itemCode", label: "Item Code", type: "text", validation: { required: "Item Code is required" } },
      { name: "itemName", label: "Item Name", type: "text", validation: { required: "Item Name is required" } },
      { name: "specification", label: "Specification", type: "text", validation: { required: "Specification is required" } },
      { name: "ALength", label: "Length", type: "number", validation: { required: "Length is required" } },
      { name: "AWidth", label: "Width", type: "number", validation: { required: "Width is required" } },

      { name: "AHeight", label: "Height", type: "number", validation: { required: "Height is required" } },
      { name: "AQuantity", label: "Quantity", type: "number", validation: { required: "Quantity is required" } },
    ]
  : view === "manufacturer"
  ? [
      { name: "ELength", label: "Length", type: "number", validation: { required: "Length is required" } },
      { name: "EHeight", label: "Height", type: "number", validation: { required: "Height is required" } },
      { name: "EWidth", label: "Width", type: "number", validation: { required: "Width is required" } },
      { name: "EQuantity", label: "Quantity", type: "number", validation: { required: "Quantity is required" } },
    ] :[]
  
    const handleAsyncProcess=async (data)=>{
      
       try {
            if(triggerEdit.active){

              await dispatch(updateBomDesign([triggerEdit.id,data]));
               setTriggerEdit((val)=>({...val,active:false,id:null,bom:{}}))
            }
            else{
              //we have to add bom 
              await dispatch(addBomDesign(data));
            }
            await dispatch(fetchBom(projectId));
            reset(defaultVal);
            setAddBOM(false);
        
       } catch (error) {
        return error;
        
       }
      

    }

    const onSubmit = (data)=>{
      let updateData;
      if(view==="designer"){
              if(triggerEdit.active){

                     updateData={...data,
                      EHeight: data.AHeight,
                      EWidth: data.AWidth,
                      ELength:data.ALength,
                      EQuantity:data.AQuantity,
                      itemId:triggerEdit.bom.itemId,
                      projectNumber:projectId
                      
                    }
              }
              else{
                     updateData={...data,
                      EHeight: data.AHeight,
                      EWidth: data.AWidth,
                      ELength:data.ALength,
                      EQuantity:data.AQuantity,
                      projectNumber:projectId
                      
                    }
                    console.log(updateData)

       }
        
      }else if(view==="manufacturer"){
        if(triggerEdit.active){
         updateData={...triggerEdit.bom,
          EHeight: data.EHeight,
          EWidth: data.EWidth,
          ELength:data.ELength,
          EQuantity:data.EQuantity,
          
         }
          console.log(updateData)
        }

      }

      handleAsyncProcess(updateData);
    }


  return (
    <div className="add-bom-section">
        <div className="add-bom-header">
             <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#7D7D7D" }}>Purchase details</h3>
             {!addBOM ? (
                 view === "designer" && (
                        <button
                             className="add-bom-btn"
                             onClick={() => setAddBOM(true)}
                        >
               
                               <FiPlusCircle
                                    style={{ marginRight: "10px", width: "25px", height: "25px" }}
                                />
                                   Add Item
                        </button>
                    )
                      ) : (
                        <button
                         type="submit"
                         onClick={handleSubmit(onSubmit)}

                          className="save-bom-btn">
                        <FiSave className="save-icon" />
                        Save details
                      </button>
                    )
                    }

        </div>
        { addBOM && (

        
        <form onSubmit={handleSubmit(onSubmit)} className="add-bom-body" >
          <div className="bom-details">
            {fields.map((eachField,index)=>{
              return(
                <Controller
                key={index}
                name={eachField.name}
                control={control}
                rules={eachField.validation}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={eachField.label}
                    variant="outlined"
                    type={eachField.type}
                    sx={{
                      width: "250px",
                      marginBottom: "15px",
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                      },
                    }}
                    error={!!errors[name]}
                    helperText={errors[name]?.message}
                  />
                )}
              />
              )
            })}
            
          </div>

          
           
          
 



          <div className="delete-icon">
            <RiDeleteBin6Line
              size={20}
              onClick={() =>{
                setAddBOM(false);
                setTriggerEdit((val)=>({...val,active:false,id:null,bom:{}}))

                reset(defaultVal);
              }}
            />
          </div>
        </form>
          

        
      )}
    
    </div>
    
    
  )
}
export default AddBOM;
