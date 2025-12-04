import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Grade from './Grade';
import CheckBox from './CheckBox';
import './SearchBar.css';
import { useSelector } from 'react-redux';
import GeneralSearchBar from '../../components/GenralSearchBar';
import { fetchDepartmentSkills, fetchAssignedEmployeeData, fetchSkillsForDepartment, fetchDataBySkillsAndDepartment, saveEmployeeData } from './SkillMatrixAPI';
import {skillTrainingByDepartment} from './UpdateSkillAPI';
import SkillMatrixReport from './SkillMatrixReport';
import DepartmentSkillMatrixReport from './DepartmentSkillMatrixReport';
const SearchBar = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
   const [allDept,setAllDept] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState([]);
  const [newSelectedEmp, setNewSelectedEmp] = useState([]);
  const [removeEmp, setRemoveEmp] = useState([]);
  const [gradeChanges, setGradeChanges] = useState({});
  const [departmentExpSkill,setDepartmentExpSkill] = useState([]);
  const [disableAssign, setDisableAssign] = useState(false);
  const [isSkillMatrixReportOpen, setIsSkillMatrixReportOpen] = useState(false);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] = useState(null);
  const [isDepartmentReportOpen, setIsDepartmentReportOpen] = useState(false);

  const predepartmentId = useSelector((state) => state.auth.user?.departmentId); 
  const selectedDepartmentId = useSelector((state) => state.department.selectedDepartmentId);
  const effectiveDepartmentId = predepartmentId || selectedDepartmentId;
  const [departmentId , setDepartmentId] = useState(effectiveDepartmentId);
  const departmentName = useSelector((state) => state.auth.user?.departmentName);
  const selectedDepartmentName = useSelector((state) => state.department.selectedDepartmentName);

  const access = useSelector((state) =>  state?.auth?.user?.employeeAccess).split(',')[2];
  //const employeeMail = useSelector((state) => state.auth.user?.employeeEmail)
  
  const gradeAdd = access[5] === "1";
  const gradeRead = access[6] === "1";
  const gradeUpdate = access[7] === "1";
  const gradeDelete = access[8] === "1";

  const checkboxAdd = access[9] === "1";
  const checkboxRead = access[10] === "1";
  const checkboxUpdate = access[11] === "1";
  const checkboxDelete = access[12] === "1";

  useEffect(() => {
    invalidSelection();
  }, [gradeChanges, selectedEmp]);
  
  function invalidSelection() {
    try {
      const hasInvalidSelection = Object.values(gradeChanges).some((change) => {
        const isCheckboxSelected = selectedEmp.some(
          (emp) => emp.employeeId === change.employeeId && emp.skillId === change.skillId
        );
        return change.grade === 4 && isCheckboxSelected;
      });
    
      if (hasInvalidSelection) {
        //toast.error('Cannot assign training for grade 4!');
      }
      setDisableAssign(hasInvalidSelection);
    } catch (error) {
      console.error("Error in invalidSelection:", error);
    }
  }

  useEffect(()=>{
    skillTrainingByDepartments();
    if(departmentId){
      
      fetchDepartmentSkills(departmentId)
        .then(skills => {
          setDepartmentExpSkill(skills);
          setSelectedSkills(skills);
        })
        .catch(error =>{
          console.error("error in fetching department skills : " , error)
        })
    }
  },[departmentId]);

    // useEffect(()=>{
    //   if (objectDepartmentId.departmentId) {
    //     setDepartmentId(objectDepartmentId.departmentId);
    //     console.log("Department Id :", objectDepartmentId.departmentId);
    //   }
    // },[objectDepartmentId])

  useEffect(() => {
    fetchAssignedEmployeeData()
      .then(data => {
        setSelectedEmp(data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchSkillsForDepartment(departmentId)
        .then(skills => {
          setSkills([{ label: 'Select All', value: 'select-all' }, ...skills]);
        })
        .catch(err => {
          console.error('Failed to fetch skills: ', err);
        });
    } else {
      setSkills([]);
    }
  }, [departmentId]);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchData();
      console.log("Selected skill : ",selectedSkills)
    } else {
      setData([]);
    }
  }, [selectedSkills]);

  // useEffect(() => {
  //     const department = departments.find(dept => dept.departmentId === departmentId);
  //     if (department) {
  //       const departmentDetails = {
  //         label: department.departmentName,
  //         value: departmentId,
  //       };
  //       const event = new CustomEvent('departmentSelected', { detail: departmentDetails });
  //       window.dispatchEvent(event);
  //     } 
  // }, [departmentId, departments]);
  

  const fetchData = () => {
    setLoading(true);
    fetchDataBySkillsAndDepartment(selectedSkills, departmentId)
      .then(response => {
        console.log("Skill id :",selectedSkills)
        console.log("All main data: ", response); 
        const groupedData = groupDataByEmployee(response);
        setData(groupedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }; 

  // const clearDepartment = () => {
  //   setSelectedDepartment(null);
  //   setSelectedSkills([]);
  //   setData([]);
  // };

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
  const OnGradeChange = (employeeId, skillId, newGrade) => {
    const isCheckboxSelected = selectedEmp.some(
      (emp) => emp.employeeId === employeeId && emp.skillId === skillId
    );
  
    setGradeChanges((prev) => ({
      ...prev,
      [`${employeeId}-${skillId}`]: { employeeId, skillId, grade: newGrade },
    }));

    if (newGrade === 4 && isCheckboxSelected) {
      //toast.error('Grade 4 cannot be assigned when the checkbox is selected!');
      setDisableAssign(true);
      console.log("from grade change!!");
      return; 
    }
    if (newGrade === 4) {
      const isCheckboxSelected = selectedEmp.some(
        (emp) => emp.employeeId === employeeId && emp.skillId === skillId
      );
  
      if (isCheckboxSelected) {
        setGradeChanges((prev) => {
          const updated = { ...prev };
          delete updated[`${employeeId}-${skillId}`]; 
          return updated;
        });
      }
    }
  };
  

  // const handleSkillChange = (selectedOptions) => {
  //   const isSelectAllSelected = selectedOptions.some(option => option.value === 'select-all');
  
  //   if (isSelectAllSelected) {
  //     if (selectedOptions.length === 1) {
  //       const allSkills = skills.filter(skill => skill.value !== 'select-all');
  //       setSelectedSkills(allSkills);
  //     } else {
  //       setSelectedSkills([]);
  //     }
  //   } else {
  //     setSelectedSkills(selectedOptions);
  //   }
  // };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills((prevSkills) => {
      const updatedSkills = prevSkills.filter((skill) => skill.id !== skillToRemove.id);
      if (updatedSkills.length === 0) {
        setData([]);
      } else {
        fetchData();
      }
      return updatedSkills;
    });
  };  

  const groupDataByEmployee = (data) => {
    const groupedData = {};
    data.forEach(row => {
      if (!groupedData[row.employeeId]) {
        groupedData[row.employeeId] = {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          employeeQualification: row.employeeQualification,
          experienceInYears: row.experienceInYears,
          skills: {},
        };
      }
      groupedData[row.employeeId].skills[row.skillId] = row.grade;
    });
    console.log(Object.values(groupedData));
    return Object.values(groupedData);
  };


  function getGrade(employeeId, skillId) {
    for (const [key, value] of Object.entries(gradeChanges)){
      console.log("Values : ",value);
      if (value.employeeId === employeeId && value.skillId === skillId) {
        return value.grade; 
      }
    }
    return null; 
  }

  // const handleDeptSelect = (selectedDept)=>{
  //   setObjectDepartmentID(selectedDept);
  //   console.log('T_dept_id', selectedDept);
  // }
  const onSelectionChange = (employeeId, skillId, isChecked) => {
    if (isChecked) {
      setNewSelectedEmp(prevEmp => {
        
          const exists = prevEmp.some(emp => emp.employeeId === employeeId && emp.skillId === skillId);
          if (!exists) {
              return [...prevEmp, { employeeId: employeeId, skillId: skillId }];
          }
          return prevEmp;
      });

      setSelectedEmp(prevEmp => {
          const exists = prevEmp.some(emp => emp.employeeId === employeeId && emp.skillId === skillId);
          if (!exists) {
              return [...prevEmp, { employeeId: employeeId, skillId: skillId }];
          }
          return prevEmp;
      });
  } else {
      setNewSelectedEmp(prevEmp => prevEmp.filter(emp => !(emp.employeeId === employeeId && emp.skillId === skillId)));

      setSelectedEmp(prevEmp => {
          const exists = prevEmp.some(emp => emp.employeeId === employeeId && emp.skillId === skillId);
          if (exists) {
              setRemoveEmp(prevRemove => {
                  const existsInRemove = prevRemove.some(emp => emp.employeeId === employeeId && emp.skillId === skillId);
                  if (!existsInRemove) {
                      return [...prevRemove, { employeeId: employeeId, skillId: skillId }];
                  }
                  return prevRemove;
              });
              return prevEmp.filter(emp => !(emp.employeeId === employeeId && emp.skillId === skillId));
          }
          return prevEmp;
      });
  }
  console.log('Selected EMP : ', selectedEmp);
  console.log('New Selected emp : ', newSelectedEmp);
  console.log('Remove emp : ', removeEmp);

  const updated_grade = getGrade(employeeId,skillId)
  const grade = updated_grade;
  console.log("My grade: ", updated_grade);
  if(gradeChanges.length != 0){
    console.log("Grades  from selection change: ",gradeChanges)
  }
  const hasGrade4 = selectedEmp.some(({ employeeId: eId, skillId: sId }) => {
    if (gradeChanges[`${eId}-${sId}`] === 4) {
      console.log("eId ", eId);
      console.log("sId ", sId);
      console.log("grade ", gradeChanges[`${eId}-${sId}`]);
      //toast.error('Checkbox cannot be selected for Grade 4!');
      setDisableAssign(true);
      console.log("Called me");
      return true;
    }
    return false;
  });
  
  if (hasGrade4) return;
  
  if (isChecked && grade === 4) {
    //toast.error('Checkbox cannot be selected for Grade 4!');
    setDisableAssign(true);
    console.log("Called me");
    return; 
  }    
  setDisableAssign(false);
};
  
  const handleGenerateReport = (employeeId, employeeName) => {
    console.log(`Generate report for Employee ID: ${employeeId}, Name: ${employeeName}`);
    
    // Find the employee data from the table
    const employeeData = data.find(emp => emp.employeeId === employeeId);
    
    if (employeeData) {
      setSelectedEmployeeForReport({
        employeeId: employeeId,
        employeeName: employeeName,
        employeeData: employeeData
      });
      setIsSkillMatrixReportOpen(true);
    } else {
      console.error('Employee data not found');
    }
  };

  const handleCloseSkillMatrixReport = () => {
    console.log('Closing skill matrix report');
    setIsSkillMatrixReportOpen(false);
    setSelectedEmployeeForReport(null);
  };

  const handleGenerateDepartmentReport = () => {
    console.log(`Generate department report for: ${departmentName || selectedDepartmentName}`);
    if (data && data.length > 0) {
      setIsDepartmentReportOpen(true);
    } else {
      toast.error('No employee data available to generate report');
    }
  };

  const handleCloseDepartmentReport = () => {
    console.log('Closing department report');
    setIsDepartmentReportOpen(false);
  };

  const handleSave = () => {
    saveEmployeeData(newSelectedEmp, removeEmp, gradeChanges)
      .then(() => {
        toast.success("Data updated successfully!");
        setNewSelectedEmp([]);
        setRemoveEmp([]);
        setGradeChanges({});
        fetchData();
      })
      .catch((error) => {
        console.error("There was an error saving the data!", error);
        toast.error("Failed to save data.");
      });
  };

  return (
    <div className='searchbar-content'>
      {(gradeUpdate || checkboxUpdate) && (
        <div className='searchbar-assign-cls'>
        <button className='searchbar-assign' 
          onClick={handleSave} 
          disabled={disableAssign}
          style={{
            cursor: disableAssign ? 'not-allowed' : 'pointer',
            opacity: disableAssign ? 0.6 : 1, 
          }}
        >
          Assign
        </button>
      </div>)}

      <div className='searchbar-button-bar'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '30px' }}>
          <h3 className='update-skill-dept-name'>Department name: {departmentName || selectedDepartmentName || 'Unknown'}</h3>
          {data.length > 0 && (
            <button 
              className='searchbar-report-btn'
              onClick={handleGenerateDepartmentReport}
              title='Generate department skill matrix report for all employees'
              style={{ marginTop: 0, marginRight: '10px', flexShrink: 0 }}
            >
              Department Report
            </button>
          )}
        </div>
        {/* {employeeMail === 'admin@gmail.com' && (
                    <GeneralSearchBar
                    label='Search Department'
                    options = {allDept} 
                    displayKey = "departmentName"
                    selectedValues={objectDepartmentId}
                    setSelectedValues={handleDeptSelect}
                    placeholder = 'Department'
                    />
        
                  ) } */}
        <GeneralSearchBar 
          options={departmentExpSkill}
          includeSelectAll = {true}
          isMultiSelect = {true}
          selectedValues={selectedSkills}
          setSelectedValues={setSelectedSkills}
          label='Select skills'
        />
      </div>
    
      <div className="selected-skills-container">
        {selectedSkills.map(skill => (
          <div key={skill.id} className="skill-bubble">
            {skill.label}
            <span className="remove-skill" onClick={() => removeSkill(skill)}>x</span>
          </div>
        ))}
      </div>
  
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
  
      {selectedSkills.length === 0 ? (
        <div className='searchbar-no-data'>No data available!</div>
      ) :
      data.length > 0 && (
        <div className="searchbar-table-containerr">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Qualifications</th>
                <th>Experience</th>
                {selectedSkills.map(skill => (
                  <th key={skill.id}>{skill.label}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.employeeName}</td>
                  <td>{row.employeeQualification}</td>
                  <td>{row.experienceInYears}</td>
                  {selectedSkills.map(skill => (
                    <td key={skill.id}>
                      {gradeRead &&
                        <Grade 
                        pemp_id={row.employeeId}
                        pskill_id={skill.id}
                        pgrade={row.skills[skill.id] || 0}
                        onGradeChange={OnGradeChange} 
                        isChangable={gradeUpdate}
                      />}
                      {checkboxRead &&
                        <CheckBox
                        pemp_id={row.employeeId}
                        pskill_id={skill.id}
                        pselectedEmp={selectedEmp}
                        onSelectionChnge={onSelectionChange}
                        disable={row.skills[skill.id] === 4}
                        disableCondition={!checkboxUpdate}
                      />}
                    </td>
                  ))}
                  <td>
                    <button 
                      className='searchbar-report-btn'
                      onClick={() => handleGenerateReport(row.employeeId, row.employeeName)}
                      title='Generate report for this employee'
                    >
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isSkillMatrixReportOpen && selectedEmployeeForReport && (
        <SkillMatrixReport
          employeeId={selectedEmployeeForReport.employeeId}
          employeeName={selectedEmployeeForReport.employeeName}
          selectedSkills={selectedSkills}
          employeeSkillData={selectedEmployeeForReport.employeeData}
          onClose={handleCloseSkillMatrixReport}
        />
      )}
      {isDepartmentReportOpen && (
        <DepartmentSkillMatrixReport
          departmentName={departmentName || selectedDepartmentName}
          departmentId={departmentId}
          employeeData={data}
          selectedSkills={selectedSkills}
          onClose={handleCloseDepartmentReport}
        />
      )}
    </div>
  );
};

export default SearchBar;
