import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiPlusCircle } from 'react-icons/fi'
import { v4 as uuid4 } from 'uuid'
import './AddStage.css'
import getTodayDate from '../../common/functions/getTodayDate'
import { getAllEmployees } from '../../../features/employeeSlice'
import StageComponent from './StageComponent'
import StageTreeNode from './StageTreeNode'
import { useDispatch, useSelector } from 'react-redux'
import { stageList } from '../../../features/stageSlice'

const AddStage = ({
  name,
  stages,
  setStages,
  action,
  stageList,
  employees,
  useTreeView = false, // New prop to enable tree view
}) => {
  const [isChanged, setIsChanged] = useState(Array(stages.length).fill(false))
  const { user } = useSelector((state) => state.auth)
  const { stages: stagesList } = useSelector((state) => state.stages)

  // Employee list for autocomplete
  const employeeList = employees?.map(
    (emp) => `${emp.employee.employeeName}(${emp.employee.customEmployeeId})`
  ) || []

  const handleAddStage = () => {
    const startDate =
      stages.length > 0 ? stages[stages.length - 1].endDate : getTodayDate()
    
    const newStage = {
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
      substages: [], // Add substages array for tree view
    }
    
    setStages([...stages, newStage])
    setIsChanged([...isChanged, false])
  }

  // Recursive helper to update a node anywhere in the tree
  const updateNodeRecursive = (nodes, updatedNode) => {
    return nodes.map((node) => {
      if (node.id === updatedNode.id) {
        return { ...updatedNode, substages: updatedNode.substages || node.substages || [] }
      }
      return {
        ...node,
        substages: node.substages
          ? updateNodeRecursive(node.substages, updatedNode)
          : [],
      }
    })
  }

  // Handler for updating a stage in tree view
  const handleUpdateStage = (updatedStage) => {
    setStages((prevStages) => {
      // First check if it's a root-level stage
      const isRootStage = prevStages.some((s) => s.id === updatedStage.id)
      if (isRootStage) {
        return prevStages.map((stage) =>
          stage.id === updatedStage.id ? updatedStage : stage
        )
      }
      // Otherwise, recursively update in substages
      return updateNodeRecursive(prevStages, updatedStage)
    })
  }

  // Recursive helper to delete a node anywhere in the tree
  const deleteNodeRecursive = (nodes, nodeId) => {
    return nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        substages: node.substages ? deleteNodeRecursive(node.substages, nodeId) : [],
      }))
  }

  // Handler for deleting a stage in tree view
  const handleDeleteStage = (stageId) => {
    setStages((prevStages) => deleteNodeRecursive(prevStages, stageId))
  }

  // Handler for adding a child substage to a stage
  const handleAddChild = (parentId, newChild) => {
    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id === parentId) {
          return {
            ...stage,
            substages: [...(stage.substages || []), newChild],
          }
        }
        // Also check recursively in substages
        return {
          ...stage,
          substages: stage.substages
            ? addChildRecursive(stage.substages, parentId, newChild)
            : [],
        }
      })
    )
  }

  // Recursive helper to add child anywhere in the tree
  const addChildRecursive = (nodes, parentId, newChild) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          substages: [...(node.substages || []), newChild],
        }
      }
      return {
        ...node,
        substages: node.substages
          ? addChildRecursive(node.substages, parentId, newChild)
          : [],
      }
    })
  }

  // If tree view is enabled, use the new tree component
  if (useTreeView) {
    return (
      <>
        <div className="schedule">
          <p>Schedule (Tree View)</p>
          <button
            type="button"
            className="flex border-2 border-[#0061A1] rounded text-[#0061A1] font-semibold p-3 hover:cursor-pointer"
            onClick={handleAddStage}
          >
            <FiPlusCircle
              style={{ marginRight: '10px', width: '25px', height: '25px' }}
            />
            Add Stage
          </button>
        </div>
        <div className="stages" style={{ height: 'auto', maxHeight: '500px' }}>
          {stages.length > 0 ? (
            stages.map((stage) => (
              <StageTreeNode
                key={stage.id}
                node={stage}
                depth={0}
                onUpdate={handleUpdateStage}
                onDelete={handleDeleteStage}
                onAddChild={handleAddChild}
                stagesList={stagesList || []}
                employeeList={employeeList}
                isStage={true}
                action={action}
              />
            ))
          ) : (
            <p className="noStageAdded">No stage added! Click "Add Stage" to begin.</p>
          )}
        </div>
      </>
    )
  }

  // Original flat view for backward compatibility
  return (
    <>
      <div className="schedule">
        <p>Schedule</p>

        <button
          type="button"
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
