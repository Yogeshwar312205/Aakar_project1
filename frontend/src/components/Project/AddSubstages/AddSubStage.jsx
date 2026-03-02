import React, { useState, useEffect, useMemo } from 'react'
import SubstageForm from './SubstageForm'
import { FiArrowLeftCircle, FiEdit } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { FaRegArrowAltCircleLeft } from 'react-icons/fa'
import { FiSave } from 'react-icons/fi'
import AddStage from '../AddStage/AddStage'
import {
  fetchProjectById,
  fetchProjects,
  resetProjectState,
  updateProject,
} from '../../../features/projectSlice'
import {
  fetchActiveStagesByProjectNumber,
  fetchSingleStageById,
  fetchStagesByPno,
  resetStageState,
  stageList,
  updateStage,
} from '../../../features/stageSlice'
import {
  addSubStage,
  getActiveSubStagesByStageId,
  resetSubstageState,
  updateSubStage,
} from '../../../features/subStageSlice'
import { getAllEmployees } from '../../../features/employeeSlice'

const AddSubStage = () => {
  const { user } = useSelector((state) => state.auth)
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })
  const dispatch = useDispatch()
  const params = useParams()
  const { pNo, sNo } = params
  useEffect(() => {
    dispatch(stageList())
  }, [dispatch])

  const navigate = useNavigate()

  useEffect(() => {
    if (pNo) {
      dispatch(fetchActiveStagesByProjectNumber(pNo))
      dispatch(fetchProjectById(pNo))
    }
    if (sNo) {
      dispatch(fetchSingleStageById(sNo))
      dispatch(getActiveSubStagesByStageId(sNo))
    }
    return () => {
      dispatch(resetProjectState())
      dispatch(resetStageState())
      dispatch(resetSubstageState())
    }
  }, [dispatch, pNo, sNo])

  const { project = {} } = useSelector((state) => state.projects)
  const { employees } = useSelector((state) => state.employee)
  const [employeeList, setEmployeeList] = useState(
    employees.map(
      (employee) =>
        `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
    )
  )
  useEffect(() => {
    dispatch(getAllEmployees())
  }, [dispatch])
  useEffect(() => {
    setEmployeeList(
      employees.map(
        (employee) =>
          `${employee.employee.employeeName}(${employee.employee.customEmployeeId})`
      )
    )
  }, [employees])
  const {
    stage: stageData = {},
    activeStages = [],
    stages: stagesList,
  } = useSelector((state) => state.stages)

  const { activeSubStages = [] } = useSelector((state) => state.substages)

  const [inputValues, setInputValues] = useState({
    stageName: '',
    startDate: '',
    endDate: '',
    owner: '',
    machine: '',
    duration: '',
    updateReason: '',
    progress: '',
    seqPrevStage:
      activeStages.length > 0
        ? activeStages[activeStages.length - 1].stageId
        : null,
    stageId: null,
  })

  const [stage, setStage] = useState([])
  const [originalStages, setOriginalStages] = useState([])

  const stageProgress = useMemo(() => {
    if (stage.length === 0) return 0
    const totalProgress = stage.reduce(
      (acc, s) => acc + Number(s.progress || 0),
      0
    )
    return totalProgress / stage.length
  }, [stage])

  const projectProgress = useMemo(() => {
    if (activeStages.length === 0) return stageProgress

    const totalProgress = activeStages.reduce((acc, currentStage) => {
      if (currentStage.stageId === inputValues.stageId) {
        return acc + stageProgress // Replace current stage's progress with stageProgress
      }
      return acc + Number(currentStage.progress || 0)
    }, 0)

    return totalProgress / activeStages.length || 1
  }, [activeStages, stageProgress, inputValues.stageId])

  useEffect(() => {
    if (stageData) {
      setInputValues((prevValues) => ({
        ...prevValues,
        ...stageData,
        stageId: stageData.stageId || prevValues.stageId,
        owner: `${stageData.owner}(${stageData.ownerId})`,
      }))
    }
  }, [stageData])

  useEffect(() => {
    if (activeSubStages.length > 0) {
      setStage(
        activeSubStages.map((s) => ({
          ...s,
          owner: `${s.owner}(${s.ownerId})`,
        }))
      )
      setOriginalStages(
        activeSubStages.map((s) => ({
          ...s,
          owner: `${s.owner}(${s.ownerId})`,
        }))
      )
    }
  }, [activeSubStages])

  console.log({ inputValues: inputValues })
  console.log({ stage: stage })

  const handleSave = async (e) => {
    e.preventDefault()

    if (!project || !project?.projectNumber) {
      console.error('Project or projectNumber is not defined!')
      return
    }

    const updateReason =
      stage
        .filter((s, index) => hasChanges(s, originalStages[index]))
        .map(
          (s) => `Substage: ${s.stageName}, Reason: ${s.updateReason || 'N/A'}`
        )
        .join('; ') ||
      inputValues.updateReason ||
      'Progress Updated'

    const calculatedStageProgress =
      stage.length > 0
        ? stage.reduce((acc, s) => acc + Number(s.progress || 0), 0) /
          stage.length
        : inputValues.progress

    const calculatedProjectProgress =
      activeStages.length > 0
        ? activeStages.reduce((acc, currentStage) => {
            if (currentStage.stageId === inputValues.stageId) {
              return acc + calculatedStageProgress
            }
            return acc + Number(currentStage.progress || 0)
          }, 0) / activeStages.length
        : calculatedStageProgress

    await dispatch(
      updateStage({
        ...inputValues,
        progress: calculatedStageProgress,
        updateReason,
      })
    )
    await Promise.all(
      stage.map((s, index) => {
        const originalStage = originalStages[index]
        if (s && originalStage) {
          if (hasChanges(s, originalStage)) {
            return dispatch(
              updateSubStage({ ...s, stageId: sNo, projectNumber: pNo })
            )
          }
        } else if (s && !originalStage) {
          return dispatch(
            addSubStage({ ...s, stageId: sNo, projectNumber: pNo })
          )
        }
        return Promise.resolve()
      })
    )
    await dispatch(
      updateProject({
        id: pNo,
        data: {
          ...project,
          progress: calculatedProjectProgress,
          updateReason: `Stage: ${inputValues.stageName}, ${updateReason}`,
        },
      })
    )
    navigate(-1)
  }
  const hasChanges = (stage, originalStage) => {
    if (!originalStage) return true
    return Object.keys(stage).some((key) => stage[key] !== originalStage[key])
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
              <span className="font-semibold">Update stage</span>
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
          {employeeAccess[7] == '1' && (
            <SubstageForm
              inputValues={inputValues}
              setInputValues={setInputValues}
              stagesList={stagesList}
              employeeList={employeeList}
            />
          )}
          <AddStage
            name={'substage'}
            stages={stage}
            setStages={setStage}
            action={'update'}
          />
        </div>
      </form>
    </section>
  )
}

export default AddSubStage
