import React, { useEffect, useMemo, useState } from 'react'
import './AddProject.css'
import getTodayDate from '../../common/functions/getTodayDate'
import ProjectForm from '../common/ProjectForm'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { FiSave } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addProject } from '../../../features/projectSlice.js'
import AddStage from '../AddStage/AddStage'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { stageList } from '../../../features/stageSlice.js'
import { getAllEmployees } from '../../../features/employeeSlice.js'

const AddProject = () => {
  const { user } = useSelector((state) => state.auth)
  console.log(user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { employees } = useSelector((state) => state.employee)
  useEffect(() => {
    dispatch(stageList())
    dispatch(getAllEmployees())
  }, [dispatch])

  const [inputValues, setInputValues] = useState({
    projectNumber: '',
    companyName: '',
    dieName: '',
    dieNumber: '',
    projectStatus: '',
    startDate: getTodayDate(),
    endDate: '',
    projectType: '',
    progress: '',
    projectPOLink: '',
    projectDesignDocLink: '',
    projectCreatedBy: user.employeeId,
  })

  const [stages, setStages] = useState([
    {
      projectNumber: inputValues.projectNumber,
      stageName: '',
      startDate: getTodayDate(),
      endDate: null,
      owner: '',
      machine: '',
      duration: '',
      progress: '',
      seqPrevStage: null,
      createdBy: user.employeeId,
    },
  ])

  const projectProgress = useMemo(() => {
    if (stages.length === 0) return 0
    const totalProgress = stages.reduce(
      (acc, stage) => acc + Number(stage.progress || 0),
      0
    )
    console.log('Total Progress:', totalProgress)
    return totalProgress / stages.length
  }, [stages])

  useEffect(() => {
    setInputValues((prevValues) => ({
      ...prevValues,
      progress: projectProgress,
    }))
  }, [stages, projectProgress])

  const handleSave = (e) => {
    e.preventDefault()
    try {
      const projectData = {
        ...inputValues,
        stages,
      }

      console.log('Saving project data:', projectData)
      dispatch(addProject(projectData))

      setInputValues({
        projectNumber: '',
        companyName: '',
        dieName: '',
        dieNumber: '',
        projectStatus: '',
        startDate: getTodayDate(),
        endDate: null,
        projectType: '',
        progress: '',
        projectPOLink: '',
        projectDesignDocLink: '',
        projectCreatedBy: user.employeeId,
      })
      setStages([
        {
          projectNumber: '',
          stageName: '',
          startDate: getTodayDate(),
          endDate: null,
          owner: '',
          machine: '',
          duration: '',
          progress: '',
          seqPrevStage: null,
          createdBy: user.employeeId,
        },
      ])
      toast.success('Project saved successfully!')
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project successfully!')
    }
    navigate(-1)
  }

  return (
    <section className="addProject">
      <form className="addForm" onSubmit={handleSave}>
        <section className="add-employee-head flex justify-between mb-3 w-[100%]">
          <div className="flex items-center gap-3 justify-between">
            <FiArrowLeftCircle
              size={28}
              className="text-[#0061A1] hover:cursor-pointer"
              onClick={() => window.history.back()}
            />
            <div className="text-[17px]">
              <span>Dashboard / </span>
              <span className="font-semibold">Save project</span>
            </div>
          </div>
          <button
            className="flex justify-center items-center gap-3 bg-[#0061A1] text-white py-1.5 px-2 rounded"
            type="submit"
          >
            <FiEdit size={20} className="edit-icon" />
            <span>Save details</span>
          </button>
        </section>
        <div className="formDiv">
          <ProjectForm
            inputValues={inputValues}
            setInputValues={setInputValues}
            action={'add'}
          />
          <AddStage
            stages={stages}
            setStages={setStages}
            setInputValues={setInputValues}
            action={'add'}
            stageList={stageList}
            employees={employees}
          />
        </div>
      </form>
    </section>
  )
}

export default AddProject
