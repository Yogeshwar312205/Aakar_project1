import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import TableComponent from '../../components/TableComponent'; 
import './UpdateSkill.css';
import { toast } from 'react-toastify'; 
import { FiPlusCircle, FiXCircle, FiEdit, FiTrash2, FiArrowLeftCircle } from 'react-icons/fi'; 
import Textfield from '../../components/Textfield'; 
import { Checkbox } from '@mui/material';
import { departmentExpectedSkill, skillTrainingByDepartment, deactivateSkill, updateSkill, addSkill,  removeSkillFromDepartment, addSkillToDepartment  } from './UpdateSkillAPI'; // Import the API function
import { useSelector } from 'react-redux';

const UpdateSkill = () => {
  const [allDept,setAllDept] = useState([]);
  const departmentId = useSelector((state) => state.auth.user?.departmentId); 
  const departmentName = useSelector((state) => state.auth.user?.departmentName);
  const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess).split(",")[2];
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null); 
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null); 
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [selectedTrainingOption,setselectedTrainingOption] = useState([]);
  const [globalExpectedSkill,setGlobalExpectedSkill] = useState([]);

  // const [DepartmentIdGivTraining , setDepartmentIdGivTraining] = useState({});
  const navigate = useNavigate();
  const trainingOptions = [
    { label: "Giving Training", id: 1 },
    { label: "Applicable to my department", id: 3 }
  ];
  const Add = employeeAccess[1] === "1" ;
  const Update = employeeAccess[2] === "1" ;
  const Delete = employeeAccess[3] === "1";

  useEffect(() => {
    // if (departmentId) {
    //   setLoading(true);
    //   axios.get(`http://localhost:8081/skills/${departmentId}`)
    //     .then(response => {
    //       console.log("Skills ",response.data)
    //       setSkills(response.data);
    //       setLoading(false);
    //     })
    //     .catch(err => {
    //       console.error('Error fetching skills:', err);
    //       setError('Failed to fetch skills.');
    //       setLoading(false);
    //     });
    // } else {
    //   setSkills([]);
    //   setLoading(false);
    //   setError('No department selected. Please go back and select a department.');
    // }
    //// department skill fetching
    if(departmentId){
      departmentExpectedSkills();
      skillTrainingByDepartments();
    } else {
      console.error("Department ID is missing!");
      toast.error("Department ID is not available.");
    }
  }, [departmentId]);

  function convertIdtoLabel(id){
    const dataskillLable = trainingOptions.find(option => option.id === id)
    return dataskillLable ? dataskillLable.label : null;
  }

  function convertLabeltoId(label){
    const dataskillId = trainingOptions.find(option => option.label === label)
    return dataskillId ? dataskillId.id : null;
  }
  
    const departmentExpectedSkills = async () => {
      try {
        const response = await departmentExpectedSkill();
        console.log("setDepartmentSkill : ", response.data);
        console.log(response .data.filter(dept => dept.departmentSkillType !== 2))
        const twothree = response.data.filter(dept => dept.departmentSkillType !== 2).map(dept =>{ return{ ...dept, departmentSkillType: departmentId === dept.departmentId ? convertIdtoLabel(dept.departmentSkillType) : convertIdtoLabel(1) }});        setSkills(twothree);
        const expectedSkill = response.data.filter((dept) => (dept.departmentSkillType === 2 || dept.departmentSkillType === 3) && dept.departmentId === departmentId && dept.departmentSkillStatus === 1).map((dept) => dept.skillId);
        setGlobalExpectedSkill(expectedSkill);
        console.log("Expected Skill : ", expectedSkill);
        console.log("Add employee Access : ",Add)
        console.log("Update employee Access : ",Update)
        console.log("Delete employee Access : ",Delete)


      } catch (error){
        console.error("Error in fetching department skills: ", error);
      }
    };

    const skillTrainingByDepartments = async () => {
      try{
        const response = await skillTrainingByDepartment();
        const depts = response
        console.log("Response Data : ",depts);
        setAllDept(depts)
        console.log("all depts", allDept);
      } catch (error){
        console.error("There Is Error In fetching departments in update skill",error);
      } 
    };

  const handleAddSkill = () => {
    if (isBoxOpen) {
      setSkillName('');
      setSkillDescription('');
      setCurrentSkill(null);
      setIsBoxOpen(false);
    } else {
      setIsBoxOpen(true);
    }
  };

  const handleUpdateSkill = (skill) => {
    console.log("DAta for update skill : ",skill)
    setSkillName(skill.skillName);
    setSkillDescription(skill.skillDescription);
  
    // Split the departmentSkillType into an array and trim whitespace
    const updateSkillType = skill.departmentSkillType;
  
    // Filter the trainingOptions to match the types in updateSkillType
    const preSelectedTrainingOptions = trainingOptions.filter(option =>
      updateSkillType === option.label
    );
  
    // Set the filtered options
    setselectedTrainingOption(preSelectedTrainingOptions);
  
    setCurrentSkill(skill.skillId);
    setIsBoxOpen(true);
  };

  // const handleDeptSelect = (selectedDept)=>{
  //   setDepartmentIdGivTraining(selectedDept);
  //   console.log('T_dept_id', selectedDept);
  // }

  const handleDelete = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deactivateSkill(skillId); // Call the API function
        setSkills(skills.filter(skill => skill.skillId !== skillId));
        toast.success('Skill deleted successfully');
      } catch (err) {
        console.error('Error deleting skill:', err);
        setError('Failed to delete skill.');
        toast.error('Failed to delete skill.');
      }
    }
  };


  const handleSave = async () => {
    console.log("Dept id giving training:", departmentId);
  
    if (currentSkill) {
      const departmentSkillTypes = selectedTrainingOption;
      console.log("Selected triaing options",selectedTrainingOption)
      const skillData = {
        skillId: currentSkill,
        skillName,
        skillDescription,
        departmentId,
        departmentSkillTypes,
      };
  
      try {
        const updatedSkill = await updateSkill(skillData);
        skillData.departmentSkillTypes = updatedSkill.departmentSkillType;
        console.log("Ask me anything : ",skillData);
        console.log("From Update skill Data await : ",skillData)
        setSkills(
          skills.map(skill =>
            skill.skillId === currentSkill ? { ...skill, ...skillData } : skill
          )
        );
        setIsBoxOpen(false);
        setSkillName('');
        setSkillDescription('');
        setselectedTrainingOption([]);
        toast.success('Skill updated successfully');
        setCurrentSkill(null);
      } catch (error) {
        console.error('Error updating skill:', error);
        console.log("Update Skill : ",skillData);
        setError('Failed to update skill.');
        toast.error('Failed to update skill.');
      }
    } else {
      const TrainingOptionType = [1];
      const TrainingOptionTypeLabel = "Giving Training";
      const skillData = {
        skillName,
        skillDescription,
        departmentId,
        TrainingOptionType,
        TrainingOptionTypeLabel,
      };
  
      try {
        const newSkill = await addSkill(skillData);
  
        // Ensure `allDept` is defined and is an array
        const departmentLabel =
          Array.isArray(allDept) && departmentId
            ? allDept.find(dept => dept.departmentId === departmentId)?.departmentName || 'Unknown Department'
            : 'Unknown Department';
        console.log("Departmetn Name : ",departmentLabel);
        newSkill.departmentName = departmentLabel;
        setSkills([...skills, newSkill]);
        setIsBoxOpen(false);
        setSkillName('');
        setSkillDescription('');
        setselectedTrainingOption([]);
        toast.success('Skill added successfully');
      } catch (error) {
        console.error('Error adding skill:', error);
        setError('Failed to add skill.');
        toast.error('Failed to add skill.');
      }
    }
  };

  const handleOnClick = (row) => {
    const body = { skillId: row.skillId, departmentId };
  
    if (globalExpectedSkill.includes(row.skillId)) {
      // Remove skillId from the list
      console.log("Row department id", row.departmentId);
      setGlobalExpectedSkill(globalExpectedSkill.filter(ges => ges !== row.skillId));
      const updatedrow = {...row, departmentSkillType: "Give Training"};
      console.log("Global Expected Skill ffrom Expected skill s ask me anything : ",updatedrow);

      if(row.departmentId === departmentId){
        const updatedrow = {...row, departmentSkillType: "Give Training"};
        const expectedSkill = {...skills, updatedrow};
      setSkills(
        skills.map(skill =>
          skill.skillId === row.skillId ? { ...skill, ...updatedrow } : skill
        )
      );
      console.log("Global Expected Skill ffrom Expected updates state : ",expectedSkill);
      console.log("Global Expected Skill ffrom Expected : ",updatedrow);
      }
      
      const url = row.departmentId === departmentId 
        ? `http://localhost:3000/remove-3-in-deparment-skill` 
        : `http://localhost:3000/remove-2-in-deparment-skill`;
  
      removeSkillFromDepartment(body, url)
        .then(response => {
          console.log("Data removed from departmentSkill success", response);
        })
        .catch((err) => {
          console.error("Error in removing from department skill", err);
        });
    } else {
      // Add skillId to the list
      setGlobalExpectedSkill([...globalExpectedSkill, row.skillId]);
      const url = row.departmentId !== departmentId 
        ? `http://localhost:3000/add-2-in-department-skill`
        : `http://localhost:3000/add-3-in-department-skill`;
  
      addSkillToDepartment(body, url)
        .then(response => {
          console.log("Skill added to departmentSkill success", response);
          console.log("Skill S Art :",row)
          if(row.departmentId === departmentId){
            const updatedrow = {...row, departmentSkillType: "Applicable to my department"};
          const expectedSkill = {...skills, updatedrow};
          setSkills(
            skills.map(skill =>
              skill.skillId === row.skillId ? { ...skill, ...updatedrow } : skill
            )
          );
          console.log("Global Expected Skill ffrom Expected updates state : ",expectedSkill);
          console.log("Global Expected Skill ffrom Expected : ",updatedrow);
          }

          
        })
        .catch((error) => {
          console.error("Error adding skill to department skill", error);
        });
    }
  };
  


  const columns = [
    { id: 'skillName', label: 'Skill Name', align: 'center' },
    { id: 'departmentName' , label : 'Department Name',align: 'center' },
    { id: 'skillDescription',label:'Description' , align: 'center'}, 
    { id:'departmentSkillType' , label:'Department Skill Type' , align:'center'},
    
  
  ];

  if(Delete || Update){
    columns.push(
      { 
        id: 'actions',
        label: 'Actions',
        align: 'center',
        render: (row) => (
          <div className='skill-action-buttons'>
              {Update && (
                
                <FiEdit onClick = {(e) => { e.stopPropagation(); handleUpdateSkill(row); }} size={20} className="action-icon" />
              
              )}
            {
              Delete && (
                <FiTrash2 onClick = {(e) => { e.stopPropagation(); handleDelete(row.skillId); }} size={20} className="action-icon" />
              )
            }
          </div>
        )
      },
    )
  }

  if(Add || Update){
    columns.push(
      {
        id: 'CheckBox',
        label: 'Expected Skill',
        render: (row) => {
            if (!Array.isArray(globalExpectedSkill)) {
                console.error("globalExpectedSkill is not an array:", globalExpectedSkill);
                return null;
            }
            console.log("fkjhsrgfyukrgs",Add)
            return (
                <Checkbox
                    checked={globalExpectedSkill.includes(row.skillId)} 
                    onChange={() => handleOnClick(row)} // Add onChange for interactivity
                />
            );
        }
    }
    )
  }

  return (
    
    <div className='update-container'>
      {/* <header className="update-skill-dash-header">
        <FiArrowLeftCircle className="employeeSwitch-back-button" onClick={() => navigate(-1)} title="Go back"/>
        <h4 className='employeeSwitch-title'>Employee Details</h4>
      </header> */}
  
      <div className='add-skill-container'>
        <h2 className='update-skill-dept-name'>Update Skills for Department: {departmentName || 'Unknown'}</h2>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
    
        {Add  && 
          <button className='Add-skill' onClick={handleAddSkill}>
            {isBoxOpen ? <FiXCircle style={{ marginRight: '8px' }} size={20} /> : <FiPlusCircle style={{ marginRight: '8px' }} size={20} />}
            {isBoxOpen ? 'Cancel' : 'Add Skill'}
          </button>
        }
      </div>

      {isBoxOpen && (
        <div className='input-box'>
          <Textfield
            label='Skill Name'
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            name='skillName'
          />

          <Textfield
            label='Description'
            value={skillDescription}
            onChange={(e) => setSkillDescription(e.target.value)}
            name='skillDescription'
          />

          <button className='skill-save'
            onClick={handleSave} style={{ backgroundColor: '#0061A1', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '25px', alignItems: 'center' }}>
            {currentSkill ? 'Update' : 'Add'}
          </button>
        </div>
      )}

      <div className='update-skill-table-container'>
        <TableComponent
          rows={skills}
          columns={columns}
           rowClassName="table-row"
        />
      </div>
    </div>
  );
};

export default UpdateSkill;