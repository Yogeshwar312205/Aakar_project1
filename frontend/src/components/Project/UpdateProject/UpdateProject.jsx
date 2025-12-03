import React, { useState, useEffect, useMemo } from 'react'
import './../AddProject/AddProject.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProjectById,
  fetchProjects,
  resetProjectState,
  updateProject,
} from '../../../features/projectSlice.js'
import { useNavigate, useParams } from 'react-router-dom'
import { formatDate } from '../../common/functions/formatDate.js'
import ProjectForm from '../common/ProjectForm.jsx'
import AddStage from '../AddStage/AddStage.jsx'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { FaRegArrowAltCircleLeft } from 'react-icons/fa'
import { FiSave } from 'react-icons/fi'
import {
  addStage,
  fetchActiveStagesByProjectNumber,
  fetchStagesByPno,
  resetStageState,
  stageList,
  updateStage,
} from '../../../features/stageSlice.js'
import { resetSubstageState } from '../../../features/subStageSlice.js'

const UpdateProject = () => {
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })
  const params = useParams()
  const pNo = params.id
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { project = {}, loading: projectLoading } = useSelector(
    (state) => state.projects
  )
  console.log(project)
  const { activeStages = [], loading: stageLoading } = useSelector(
    (state) => state.stages
  )

  console.log(activeStages)

  const [inputValues, setInputValues] = useState({
    projectNumber: '',
    companyName: '',
    dieName: '',
    dieNumber: '',
    projectStatus: '',
    startDate: '',
    endDate: '',
    projectType: '',
    projectPOLink: '',
    progress: 0,
    projectDesignDocLink: '',
    updateReason: '',
  })

  const navigate = useNavigate()
  const [stage, setStage] = useState([])
  const [originalStages, setOriginalStages] = useState([])

  useEffect(() => {
    if (pNo) {
      dispatch(fetchProjectById(pNo))
      dispatch(stageList())
      dispatch(fetchActiveStagesByProjectNumber(pNo))
      dispatch(fetchProjects())
    }
    return () => {
      dispatch(resetProjectState())
      dispatch(resetStageState())
      dispatch(resetSubstageState())
    }
  }, [dispatch, pNo])

  const projectProgress = useMemo(() => {
    if (stage.length === 0) return project?.progress
    const totalProgress = stage.reduce(
      (acc, s) => acc + Number(s.progress || 0),
      0
    )
    return totalProgress / stage.length
  }, [stage])

  useEffect(() => {
    setInputValues((prevValues) => ({
      ...prevValues,
      progress: projectProgress,
    }))
  }, [stage, projectProgress])

  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      setInputValues({
        ...project,
        progress: projectProgress,
      })
    }
  }, [project, projectProgress])

  useEffect(() => {
    if (activeStages && activeStages.length > 0) {
      setStage(
        activeStages.map((s) => ({
          ...s,
          owner: `${s.owner}(${s.ownerId})`,
        }))
      )
      setOriginalStages(
        activeStages.map((s) => ({
          ...s,
          owner: `${s.owner}(${s.ownerId})`,
        }))
      )
    }
  }, [activeStages])
  console.log({ updateInputValuesBefore: inputValues })

  const handleSave = (e) => {
    e.preventDefault()
    console.log({ updateInputValuesAfter: inputValues })
    inputValues.updateReason
    const updateReason =
      stage
        .filter((s, index) => hasChanges(s, originalStages[index]))
        .map(
          (s) =>
            `Stage: ${s.stageName}, Reason: ${s.updateReason || 'Not Provided'}`
        )
        .join('; ') ||
      inputValues.updateReason ||
      'Progress Updated'

    stage.forEach((s, index) => {
      const originalStage = originalStages[index]
      if (originalStage && hasChanges(s, originalStage)) {
        // Update existing stages
        console.log({ originalStageFu: originalStage })
        console.log({ sFu: s })
        dispatch(updateStage({ ...s, projectNumber: pNo }))
      } else if (!originalStage && s.stageId === undefined) {
        // Add only new stages without IDs
        console.log({ originalStageFu2: originalStage })
        console.log({ sFu2: s })
        dispatch(addStage({ ...s, projectNumber: pNo }))
      }
    })

    dispatch(
      updateProject({
        id: pNo,
        data: {
          ...inputValues,
          updateReason: `${updateReason}`,
        },
      })
    )
    navigate(-1)
  }

  const hasChanges = (stage, originalStage) => {
    if (!stage || !originalStage) return false
    return Object.keys(stage).some((key) => {
      // Ignore fields that don't indicate a meaningful change
      if (['createdBy', 'timestamp'].includes(key)) return false
      return stage[key] !== originalStage[key]
    })
  }

  return (
    <>
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
                <span className="font-semibold">Update project</span>
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
            {employeeAccess[3] == '1' && (
              <ProjectForm
                action={'update'}
                inputValues={inputValues}
                setInputValues={setInputValues}
              />
            )}

            <AddStage stages={stage} setStages={setStage} action={'update'} />
          </div>
        </form>
      </section>
    </>
  )
}

export default UpdateProject
