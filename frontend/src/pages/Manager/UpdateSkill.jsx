import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import TableComponent from '../../components/TableComponent';
import './UpdateSkill.css';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiXCircle, FiEdit, FiTrash2, FiArrowLeftCircle } from 'react-icons/fi';
import Textfield from '../../components/Textfield';
import { Checkbox } from '@mui/material';
import { departmentExpectedSkill, skillTrainingByDepartment, deactivateSkill, updateSkill, addSkill,  removeSkillFromDepartment, addSkillToDepartment } from './UpdateSkillAPI';
import {fetchDepartmentSkills} from './SkillMatrixAPI';
import axios from 'axios';
import reportMetadata from './reportMetadata.json'
import SkillReportGenerator from './skillreportgenerator'
import { useSelector } from 'react-redux';
import GeneralSearchBar from '../../components/GenralSearchBar';

const UpdateSkill = () => {
  const [allDept,setAllDept] = useState([]);
  const employeeAccess = useSelector((state) => state.auth.user?.employeeAccess).split(",")[2];
  const allInfo = useSelector((state) => state.auth.user);
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

  const navigate = useNavigate();
  const trainingOptions = [
    { label: "Giving Training", id: 1 },
    { label: "Applicable to my department", id: 3 }
  ];

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
    skillTrainingByDepartments();
    console.log("All info ",allInfo);
    console.log("Pre dept id: ", predepartmentId);
    console.log("selected dept id: ", selectedDepartmentId);
    console.log("effective dept id: ", effectiveDepartmentId);
    if(departmentId){
      console.log("Selected department id : ",departmentId);
      fetchDepartmentSkill();
      // Removed departmentExpectedSkills() call as its logic is now integrated into fetchDepartmentSkill()
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

    const fetchDepartmentSkill = async () => {
      try {
        // Fetch all department-skill relationships
        const expectedResp = await departmentExpectedSkill();
        const expectedData = expectedResp?.data || expectedResp || [];
        
        // Get skills that this department has marked as applicable (type 2 or 3)
        const expectedSkillIds = expectedData
          .filter((dept) => dept.departmentId === departmentId && (dept.departmentSkillType === 2 || dept.departmentSkillType === 3) && dept.departmentSkillStatus === 1)
          .map((dept) => dept.skillId);

        // Create a map to track which skills we've already added to avoid duplicates
        const skillMap = new Map();
        
        // Create a map to track MY department's relationship with each skill
        const myDepartmentRelationships = new Map();
        expectedData.forEach(dept => {
          if (dept.departmentId === departmentId && dept.departmentSkillStatus === 1) {
            myDepartmentRelationships.set(dept.skillId, dept.departmentSkillType);
          }
        });

        expectedData.forEach(dept => {
          // Skip inactive skills
          if (dept.departmentSkillStatus !== 1) {
            return;
          }

          const skillId = dept.skillId;
          
          // For cross-department skills: Only show if type 1 or 3 (giving training)
          // Skip type 2 from OTHER departments (they're taking training, not giving)
          if (dept.departmentId !== departmentId && dept.departmentSkillType === 2) {
            return;
          }
          
          // If we haven't seen this skill yet, add it
          if (!skillMap.has(skillId)) {
            // Determine the display type for this skill
            let displayType;
            
            if (dept.skillOwnerDeptId === departmentId) {
              // This is OUR department's skill - show our relationship type
              displayType = convertIdtoLabel(dept.departmentSkillType);
            } else {
              // This is ANOTHER department's skill
              // Check if MY department has marked it as applicable (type 2)
              const myRelationship = myDepartmentRelationships.get(skillId);
              if (myRelationship === 2) {
                displayType = 'Applicable to my department';
              } else {
                displayType = 'Giving Training';
              }
            }
            
            skillMap.set(skillId, {
              skillId: skillId,
              skillName: dept.skillName,
              departmentId: dept.skillOwnerDeptId, // ALWAYS use the skill owner department ID
              departmentName: dept.skillOwnerDeptName, // ALWAYS use the skill owner department name
              skillDescription: dept.skillDescription,
              departmentSkillType: displayType,
            });
          } else if (dept.departmentId === departmentId) {
            // If this is OUR department's entry for a skill we already added,
            // update the type to reflect our relationship (but keep original department name)
            const existing = skillMap.get(skillId);
            existing.departmentSkillType = convertIdtoLabel(dept.departmentSkillType);
          }
        });

        const mappedSkills = Array.from(skillMap.values());

        setSkills(mappedSkills);
        setGlobalExpectedSkill(expectedSkillIds);

        console.log("Department skills count:", mappedSkills.length);
        console.log("Expected Skill IDs (type 2 or 3):", expectedSkillIds);
        console.log("My department relationships:", Array.from(myDepartmentRelationships.entries()));
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

  const [skillReportMeta, setSkillReportMeta] = useState(null);

  const skillreport= () => {
    const reportMeta = reportMetadata['Skill Report'] || Object.values(reportMetadata)[0] || {};
    setSkillReportMeta(reportMeta);
  };

  const handleUpdateSkill = (skill) => {
    console.log("DAta for update skill : ",skill)
    setSkillName(skill.skillName);
    setSkillDescription(skill.skillDescription);

    const updateSkillType = skill.departmentSkillType;

    const preSelectedTrainingOptions = trainingOptions.filter(option =>
      updateSkillType === option.label
    );

    setselectedTrainingOption(preSelectedTrainingOptions);

    setCurrentSkill(skill.skillId);
    setIsBoxOpen(true);
  };


  const handleDelete = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deactivateSkill(skillId);
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

    // Determine the skill type based on ownership
    // If the skill belongs to MY department -> type3 (own skill)
    // If the skill belongs to ANOTHER department -> type2 (cross-department)
    const skillType = row.departmentId === departmentId ? 'type3' : 'type2';

    const originalExpectedSkill = globalExpectedSkill;
    const originalSkills = skills;

    if (globalExpectedSkill.includes(row.skillId)) {
      // UNCHECKING - Remove the skill from applicable list
      console.log('Removing expected skill, request body:', body, 'skillType:', skillType);
      console.log('Original skill owner department:', row.departmentId, 'Current department:', departmentId);

      try {
        // Optimistically update UI
        setGlobalExpectedSkill(prev => prev.filter(ges => ges !== row.skillId));

        // Update the UI display based on skill ownership
        if (row.departmentId === departmentId) {
          // This is our own department's skill - change to "Giving Training"
          setSkills(prevSkills => prevSkills.map(skill =>
            skill.skillId === row.skillId
              ? { ...skill, departmentSkillType: 'Giving Training' }
              : skill
          ));
        } else {
          // This is a cross-department skill - change to "Giving Training"
          // (removes "Applicable to my department" label)
          setSkills(prevSkills => prevSkills.map(skill =>
            skill.skillId === row.skillId
              ? { ...skill, departmentSkillType: 'Giving Training' }
              : skill
          ));
        }

        await removeSkillFromDepartment(body, skillType);
        console.log('Skill successfully removed from expected skills');
        console.log('Skill ownership remains with department:', row.departmentId);
        toast.success('Skill removed from applicable skills');
      } catch (err) {
        // Revert on error
        setGlobalExpectedSkill(originalExpectedSkill);
        setSkills(originalSkills);
        console.error('Error in removing from department skill:', err?.response || err);
        toast.error('Failed to remove skill. Changes reverted.');
      }
    } else {
      // CHECKING - Add the skill to applicable list
      console.log('Adding expected skill, request body:', body, 'skillType:', skillType);
      console.log('Original skill owner department:', row.departmentId, 'Current department:', departmentId);

      try {
        // Optimistically update UI
        setGlobalExpectedSkill(prev => [...prev, row.skillId]);

        // Update the UI display - ALWAYS show "Applicable to my department" when checked
        setSkills(prevSkills => prevSkills.map(skill =>
          skill.skillId === row.skillId
            ? { ...skill, departmentSkillType: 'Applicable to my department' }
            : skill
        ));

        await addSkillToDepartment(body, skillType);
        console.log('Skill successfully added to expected skills');
        console.log('Skill ownership remains with department:', row.departmentId);
        toast.success('Skill marked as applicable to your department');
      } catch (error) {
        // Revert on error
        setGlobalExpectedSkill(originalExpectedSkill);
        setSkills(originalSkills);
        console.error('Error adding skill - full error:', error);
        console.error('Error response data:', error?.response?.data);
        toast.error('Failed to add skill. Changes reverted.');
      }
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
                    onChange={() => handleOnClick(row)}
                />
            );
        }
    }
    )
  }

  return (

    <div className='update-container'>
      <div className='add-skill-container'>
        <h2 className='update-skill-dept-name'>Update Skills for Department: {departmentName || selectedDepartmentName || 'Unknown'}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {Add  &&
          <button className='Add-skill' onClick={handleAddSkill}>
            {isBoxOpen ? <FiXCircle style={{ marginRight: '8px' }} size={20} /> : <FiPlusCircle style={{ marginRight: '8px' }} size={20} />}
            {isBoxOpen ? 'Cancel' : 'Add Skill'}
          </button>
        }
        <button
          className='Skill-report'
          onClick={skillreport}
          style={{ marginLeft: '12px' }}
          title='Generate Skill Report'
        >
          Skill Report
        </button>
      </div>

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
