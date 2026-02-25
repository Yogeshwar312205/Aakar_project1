import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import TableComponent from '../../components/TableComponent'; 
import './UpdateSkill.css';
import { toast } from 'react-toastify'; 
import { FiPlusCircle, FiXCircle, FiEdit, FiTrash2, FiArrowLeftCircle } from 'react-icons/fi'; 
import Textfield from '../../components/Textfield'; 
import { Checkbox } from '@mui/material';
import { departmentExpectedSkill, skillTrainingByDepartment, deactivateSkill, updateSkill, addSkill,  removeSkillFromDepartment, addSkillToDepartment } from './UpdateSkillAPI'; // Import the API function
import {fetchDepartmentSkills} from './SkillMatrixAPI';
import axios from 'axios';
import reportMetadata from './reportMetadata.json'
import SkillReportGenerator from './skillreportgenerator'
import { useSelector } from 'react-redux';
import { IP } from '../../constants';
import GeneralSearchBar from '../../components/GenralSearchBar';

const UpdateSkill = () => {
  const [allDept,setAllDept] = useState([]);
  const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess).split(",")[2];
  const allInfo = useSelector((state) => state.auth.user);
  //const employeeMail = useSelector((state) => state.auth.user?.employeeEmail)
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null); 
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null); 
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [selectedTrainingOption,setselectedTrainingOption] = useState([]);
  const [globalExpectedSkill,setGlobalExpectedSkill] = useState([]);

  const predepartmentId = useSelector((state) => state.auth.user?.departmentId); 
  const selectedDepartmentId = useSelector((state) => state.department.selectedDepartmentId);
  const effectiveDepartmentId = predepartmentId || selectedDepartmentId;
  const [departmentId , setDepartmentId] = useState(effectiveDepartmentId);
  const departmentName = useSelector((state) => state.auth.user?.departmentName);
  const selectedDepartmentName = useSelector((state) => state.department.selectedDepartmentName);
  //const [objectDepartmentId , setObjectDepartmentID] = useState({});
  
  // const [DepartmentIdGivTraining , setDepartmentIdGivTraining] = useState({});
  const navigate = useNavigate();
  const trainingOptions = [
    { label: "Giving Training", id: 1 },
    { label: "Applicable to my department", id: 3 }
  ];

  // Helper to get label from departmentSkillType ID
  const getTypeLabel = (typeId) => {
    const option = trainingOptions.find(opt => opt.id === typeId);
    return option ? option.label : 'Unknown Type';
  };
  const Add = employeeAccess[1] === "1" ;
  const Update = employeeAccess[2] === "1" ;
  const Delete = employeeAccess[3] === "1";
  const state = useSelector((state) => state);
  useEffect(() => {
    console.log('Redux State:', state);
    // if (departmentId) {
    //   setLoading(true);
    //   axios.get(`http://${IP}:8081/skills/${departmentId}`)
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
    skillTrainingByDepartments();
    console.log("All info ",allInfo);
    console.log("Pre dept id: ", predepartmentId);
    console.log("selected dept id: ", selectedDepartmentId);
    console.log("effective dept id: ", effectiveDepartmentId);
    if(departmentId){
      console.log("Selected department id : ",departmentId);
      fetchDepartmentSkill()
      departmentExpectedSkills();
    } else {
      console.error("Department ID is missing!");
      toast.error("Department ID is not available.");
    }
  }, [departmentId]);

  // useEffect(()=>{
  //   setDepartmentId(objectDepartmentId.departmentId);
  //   console.log("Department Id :" , objectDepartmentId)
  // },[objectDepartmentId])

  function convertIdtoLabel(id){
    const dataskillLable = trainingOptions.find(option => option.id === id)
    return dataskillLable ? dataskillLable.label : null;
  }

  function convertLabeltoId(label){
    const dataskillId = trainingOptions.find(option => option.label === label)
    return dataskillId ? dataskillId.id : null;
  }
  
    const fetchDepartmentSkill = async () => {
      try {
        // department-specific skills (full objects including description)
        const resp = await axios.get(`http://${IP}:3000/skills/${departmentId}`);
        const deptSkills = resp?.data || [];

        // First fetch expected-skills to compute checkbox state and correct type for this department
        const expectedResp = await departmentExpectedSkill();
        const expectedData = expectedResp?.data || expectedResp || [];
        // Checkbox should be checked only for skills with type 3 (Applicable to my department) and active status
        const expectedSkillIds = expectedData
          .filter((dept) => dept.departmentId === departmentId && dept.departmentSkillType === 3 && dept.departmentSkillStatus === 1)
          .map((dept) => dept.skillId);

        // Map department skills into the shape expected by the table
        // Check if skill is in expectedSkillIds to determine the correct type
        const deptOnly = Array.isArray(deptSkills) ? deptSkills.map(ds => {
          const skillId = ds.skillId || ds.id;
          return {
            skillId: skillId,
            skillName: ds.skillName || ds.label,
            departmentId: ds.departmentId || departmentId,
            departmentName: ds.departmentName || departmentName || selectedDepartmentName || '',
            skillDescription: ds.skillDescription || ds.description || '',
            // Use type 3 label if skill is in expected skills, otherwise type 1 label
            departmentSkillType: expectedSkillIds.includes(skillId) ? 'Applicable to my department' : 'Giving Training',
          };
        }) : [];

        // Use only department-specific skills for display
        setSkills(deptOnly);
        setGlobalExpectedSkill(expectedSkillIds);

        console.log("Department skills count:", deptOnly.length);
        console.log("Expected Skill : ", expectedSkillIds);
      } catch (error){
        console.error("Error in fetching department skills: ", error);
      }
    };

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

  // Placeholder handler for future skill report generation
  const [skillReportMeta, setSkillReportMeta] = useState(null);

  const skillreport= () => {
    // prepare metadata similarly to TrainingDetails.handleReport
    const reportMeta = reportMetadata['Skill Report'] || Object.values(reportMetadata)[0] || {};
    setSkillReportMeta(reportMeta);
    // the SkillReportGenerator opens its own preview modal when mounted
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

  const handleOnClick = async (row) => {
    const body = { skillId: row.skillId, departmentId };

    // Determine skill type based on whether skill belongs to this department
    // Type 3 = Applicable to my department (same dept), Type 2 = From other dept
    const skillType = row.departmentId === departmentId ? 'type3' : 'type2';

    // Store original state for rollback
    const originalExpectedSkill = globalExpectedSkill;
    const originalSkills = skills;

    if (globalExpectedSkill.includes(row.skillId)) {
      // REMOVE: Skill is currently expected, user is unchecking
      console.log('Removing expected skill, request body:', body, 'skillType:', skillType);

      try {
        // OPTIMISTIC UPDATE: Remove from globalExpectedSkill immediately
        setGlobalExpectedSkill(prev => prev.filter(ges => ges !== row.skillId));

        // If skill belongs to current department, update departmentSkillType to "Giving Training"
        if (row.departmentId === departmentId) {
          setSkills(prevSkills => prevSkills.map(skill =>
            skill.skillId === row.skillId 
              ? { ...skill, departmentSkillType: 'Giving Training' } 
              : skill
          ));
        }

        // Call API
        await removeSkillFromDepartment(body, skillType);
        console.log('Skill successfully removed from expected skills');
        toast.success('Skill removed from expected skills');
      } catch (err) {
        // Rollback on error
        setGlobalExpectedSkill(originalExpectedSkill);
        setSkills(originalSkills);
        console.error('Error in removing from department skill:', err?.response || err);
        toast.error('Failed to remove skill from expected skills. Changes reverted.');
      }
    } else {
      // ADD: Skill is not expected, user is checking
      console.log('Adding expected skill, request body:', body, 'skillType:', skillType);

      try {
        // OPTIMISTIC UPDATE: Add to globalExpectedSkill immediately
        setGlobalExpectedSkill(prev => [...prev, row.skillId]);

        // If skill belongs to current department, update departmentSkillType to "Applicable to my department"
        if (row.departmentId === departmentId) {
          setSkills(prevSkills => prevSkills.map(skill =>
            skill.skillId === row.skillId 
              ? { ...skill, departmentSkillType: 'Applicable to my department' } 
              : skill
          ));
        }

        // Call API
        await addSkillToDepartment(body, skillType);
        console.log('Skill successfully added to expected skills');
        toast.success('Skill added to expected skills');
      } catch (error) {
        // Rollback on error
        setGlobalExpectedSkill(originalExpectedSkill);
        setSkills(originalSkills);
        console.error('Error adding skill - full error:', error);
        console.error('Error response data:', error?.response?.data);
        toast.error('Failed to add skill to expected skills. Changes reverted.');
      }
    }
  };

  // const handleDeptSelect = (selectedDept)=>{
  //   setObjectDepartmentID(selectedDept);
  //   setDepartmentId(selectedDept.departmentId);
  //   console.log('T_dept_id', selectedDept);
  // }
  


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
        <h2 className='update-skill-dept-name'>Update Skills for Department: {departmentName || selectedDepartmentName || 'Unknown'}</h2>
        {/* {employeeMail === 'admin@gmail.com' && (
            <GeneralSearchBar
            label='Search Department'
            options = {allDept} 
            displayKey = "departmentName"
            selectedValues={objectDepartmentId}
            setSelectedValues={handleDeptSelect}
            placeholder = 'Department'
            />

          ) }
        {console.log("deparef : " , departmentId)} */}
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
    
        {Add  && 
          <button className='Add-skill' onClick={handleAddSkill}>
            {isBoxOpen ? <FiXCircle style={{ marginRight: '8px' }} size={20} /> : <FiPlusCircle style={{ marginRight: '8px' }} size={20} />}
            {isBoxOpen ? 'Cancel' : 'Add Skill'}
          </button>
        }
        {/* Skill Report button placed to the right of Add Skill */}
        <button
          className='Skill-report'
          onClick={skillreport}
          style={{ marginLeft: '12px' }}
          title='Generate Skill Report'
        >
          Skill Report
        </button>
      </div>

      {/* Render SkillReportGenerator when metadata is set */}
      {skillReportMeta && (
        <SkillReportGenerator
          reportTitle={skillReportMeta.title || 'Skill Report'}
          docNo={skillReportMeta.docNo}
          OriginDate={skillReportMeta.OriginDate}
          revNo={skillReportMeta.revNo}
          revDate={skillReportMeta.revDate}
          departmentName={departmentName || selectedDepartmentName}
          departmentId={departmentId}
          tableHeaders={[ 'Skill Name', 'Department', 'Description', 'Type' ]}
          tableData={skills.map(s => ({
            'Skill Name': s.skillName,
            'Department': s.departmentName,
            'Description': s.skillDescription,
            'Type': s.departmentSkillType,
            skillName: s.skillName,
            departmentName: s.departmentName,
            skillDescription: s.skillDescription,
            departmentSkillType: s.departmentSkillType,
          }))}
          onClose={() => setSkillReportMeta(null)}
        />
      )}

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