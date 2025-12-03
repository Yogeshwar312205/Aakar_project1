import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiPlusCircle } from 'react-icons/fi'
import { v4 as uuid4 } from 'uuid'
import './AddStage.css'
import getTodayDate from '../../common/functions/getTodayDate'
import { getAllEmployees } from '../../../features/employeeSlice'
import StageComponent from './StageComponent'
import { useDispatch, useSelector } from 'react-redux'
import { stageList } from '../../../features/stageSlice'

const AddStage = ({
  name,
  stages,
  setStages,
  action,
  stageList,
  employees,
}) => {
  const [isChanged, setIsChanged] = useState(Array(stages.length).fill(false))
  const { user } = useSelector((state) => state.auth)
  const handleAddStage = () => {
    const startDate =
      stages.length > 0 ? stages[stages.length - 1].endDate : getTodayDate()
    setStages([
      ...stages,
      {
        id: uuid4(),
        stageName: '',
        startDate: startDate,
        endDate: '',
        owner: '',
        machine: '',
        duration: '',
        seqPrevStage:
          stages.length > 0
            ? name == 'substage'
              ? stages[stages.length - 1].substageId
              : stages[stages.length - 1].stageId
            : null,
        createdBy: user.employeeId,
        updateReason: '',
        progress: '',
      },
    ])
    console.log({ stages: stages })
    setIsChanged([...isChanged, false])
  }
  console.log(stages)
  return (
    <>
      <div className="schedule">
        <p>Schedule</p>

        <button
          className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
          onClick={handleAddStage}
        >
          <FiPlusCircle
            style={{ marginRight: '10px', width: '25px', height: '25px' }}
          />
          Add {name == 'substage' ? 'Substage' : 'Stage'}
        </button>
      </div>
      <div className="stages">
        {stages.length > 0 ? (
          stages.map((stage, index) => (
            <StageComponent
              key={stage.id}
              stage={stage}
              stages={stages}
              index={index}
              action={action}
              setStages={setStages}
              isChanged={isChanged}
              setIsChanged={setIsChanged}
              name={name}
              employees={employees}
            />
          ))
        ) : (
          <p className="noStageAdded">No stage added!</p>
        )}
      </div>
    </>
  )
}

export default AddStage
