import "./BomPage.css"
import { FiArrowLeftCircle, FiDownload } from 'react-icons/fi'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AddBOM from "../AddBOM/AddBOM.jsx"
import TableComponent from '../Table/TableComponent.jsx'
import ImportBOMDialog from '../ImportBOM/ImportBOMDialog.jsx'
import ImportBOMExcelDialog from '../ImportBOMExcel/ImportBOMExcelDialog.jsx'
import { useDispatch, useSelector } from "react-redux"
import { fetchBom, deleteBomDesign } from "../../../features/BOM.js"
import { fetchActiveStagesByProjectNumber } from "../../../features/stageSlice.js"
import { Tabs, Tab } from '@mui/material'
import { FiPlusCircle } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import axios from 'axios'

const BOMPage = ({ view = "designer" }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [triggerEdit, setTriggerEdit] = useState({ active: false, id: null, bom: {} })
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedStageIdx, setSelectedStageIdx] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [excelImportOpen, setExcelImportOpen] = useState(false)

  const bom = useSelector((state) => state.BOM.BOMDesign)
  const activeProjects = useSelector((state) => state.projects.activeProjects)
  const stages = useSelector((state) => state.stages.activeStages)
  const filteredProject = activeProjects.find((p) => p.projectNumber == projectId)

  useEffect(() => {
    dispatch(fetchBom(projectId))
    dispatch(fetchActiveStagesByProjectNumber(projectId))
  }, [dispatch, projectId])

  useEffect(() => {
    if (triggerEdit.active) {
      const found = bom.find((b) => b.bomId === triggerEdit.id)
      if (found) {
        setTriggerEdit((prev) => ({ ...prev, bom: found }))
        setShowAddForm(true)
      }
    }
  }, [triggerEdit.active, triggerEdit.id, bom])

  const currentStage = stages && stages.length > 0 ? stages[selectedStageIdx] : null
  const currentStageId = currentStage ? currentStage.stageId : null

  const filteredBom = Array.isArray(bom)
    ? bom.filter((item) => {
        if (!currentStageId) return true
        return Number(item.stageId) === Number(currentStageId)
      })
    : []

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this BOM item?')) {
      await dispatch(deleteBomDesign(itemId))
      dispatch(fetchBom(projectId))
    }
  }

  const handleTabChange = (e, newVal) => {
    setSelectedStageIdx(newVal)
    setShowAddForm(false)
    setTriggerEdit({ active: false, id: null, bom: {} })
  }

  const handleExportExcel = () => {
    if (!Array.isArray(bom) || bom.length === 0) {
      window.alert('No BOM items available to export for this project.')
      return
    }

    const stageNameMap = new Map((stages || []).map((stage) => [Number(stage.stageId), stage.stageName]))

    const exportRows = bom.map((item, idx) => ({
      SrNo: idx + 1,
      ProjectNumber: projectId,
      Stage: stageNameMap.get(Number(item.stageId)) || '-',
      ItemCode: item.itemCode || '-',
      ItemName: item.itemName || '-',
      Specification: item.specification || '-',
      Material: item.material || '-',
      GradeType: item.grade || '-',
      Length: item.ALength ?? '-',
      Width: item.AWidth ?? '-',
      Height: item.AHeight ?? '-',
      Quantity: item.AQuantity ?? '-',
      Unit: item.unit || '-',
      WeightKg: item.weight ?? '-',
      Rate: item.rate ?? '-',
      Amount: item.amount ?? '-',
      Remark: item.remark || '-',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM Items')
    XLSX.writeFile(workbook, `BOM_Project_${projectId}.xlsx`)
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/bom/downloadTemplate', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'BOM_Template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      window.alert('Failed to download template: ' + (error.message || 'Unknown error'))
    }
  }

  const columns = [
    { id: "itemName", label: "Item Name", align: "left" },
    { id: "itemCode", label: "Item Code", align: "left" },
    { id: "specification", label: "Specification", align: "left" },
    { id: "material", label: "Material", align: "left" },
    { id: "grade", label: "Grade/Type", align: "left" },
    { id: "ALength", label: "Length", align: "center" },
    { id: "AWidth", label: "Width", align: "center" },
    { id: "AHeight", label: "Height", align: "center" },
    { id: "AQuantity", label: "Qty", align: "center" },
    { id: "unit", label: "Unit", align: "center" },
    { id: "weight", label: "Weight(Kg)", align: "center" },
    { id: "rate", label: "Rate", align: "center" },
    { id: "amount", label: "Amount", align: "center" },
    { id: "remark", label: "Remark", align: "left" },
  ]

  return (
    <div className="bom-page">
      <div className="bom-page-header">
        <div className="bom-page-header-left">
          <FiArrowLeftCircle className="bom-back-icon" onClick={() => navigate("/bom-project")} />
          <div className="bom-title-wrap">
            <span className="bom-breadcrumb">
              <span className="bom-breadcrumb-dim">BOM / </span>
              {filteredProject?.dieName || projectId}
            </span>
            <span className="bom-subtitle">Bill of Materials workspace</span>
          </div>
        </div>
        <div className="bom-page-header-right">
          <button className="bom-import-btn" onClick={() => setImportOpen(true)}>
            <FiDownload size={18} /> Import
          </button>
          <button className="bom-import-btn" onClick={() => setExcelImportOpen(true)}>
            <FiDownload size={18} /> Import Excel
          </button>
          <button className="bom-import-btn" onClick={handleDownloadTemplate}>
            <FiDownload size={18} /> Download Template
          </button>
          <button className="bom-export-btn" onClick={handleExportExcel}>
            <FiDownload size={18} /> Export Excel
          </button>
        </div>
      </div>

      {filteredProject && (
        <div className="bom-project-info">
          <div className="bom-info-item">
            <span className="bom-info-label">Project No</span>
            <span className="bom-info-value">{filteredProject.projectNumber}</span>
          </div>
          <div className="bom-info-divider" />
          <div className="bom-info-item">
            <span className="bom-info-label">Company</span>
            <span className="bom-info-value">{filteredProject.companyName}</span>
          </div>
          <div className="bom-info-divider" />
          <div className="bom-info-item">
            <span className="bom-info-label">Die Name</span>
            <span className="bom-info-value">{filteredProject.dieName}</span>
          </div>
          <div className="bom-info-divider" />
          <div className="bom-info-item">
            <span className="bom-info-label">Status</span>
            <span className="bom-info-value">{filteredProject.projectStatus}</span>
          </div>
          <div className="bom-info-divider" />
          <div className="bom-info-item">
            <span className="bom-info-label">Active Stage</span>
            <span className="bom-info-value">{currentStage?.stageName || '-'}</span>
          </div>
          <div className="bom-info-divider" />
          <div className="bom-info-item">
            <span className="bom-info-label">Visible Items</span>
            <span className="bom-info-value">{filteredBom.length}</span>
          </div>
        </div>
      )}

      <div className="bom-body">
        {stages && stages.length > 0 ? (
          <div className="bom-stage-tabs">
            <Tabs
              value={selectedStageIdx}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px 10px 0 0',
                  fontFamily: 'Inter, sans-serif',
                },
                '& .Mui-selected': {
                  color: '#0e4d79',
                  fontWeight: 700,
                  background: 'linear-gradient(180deg, rgba(14, 77, 121, 0.14) 0%, rgba(14, 77, 121, 0.03) 100%)',
                },
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              {stages.map((stage) => (
                <Tab key={stage.stageId} label={stage.stageName} />
              ))}
            </Tabs>
          </div>
        ) : (
          <p className="bom-no-stages">No stages found for this project. Add stages first.</p>
        )}

        {currentStage && (
          <div className="bom-stage-content">
            {!showAddForm && view === "designer" && (
              <button className="bom-add-item-btn" onClick={() => { setShowAddForm(true); setTriggerEdit({ active: false, id: null, bom: {} }) }}>
                <FiPlusCircle size={20} /> Add Item
              </button>
            )}

            {showAddForm && (
              <AddBOM
                view={view}
                triggerEdit={triggerEdit}
                setTriggerEdit={setTriggerEdit}
                stageId={currentStageId}
                onClose={() => { setShowAddForm(false); setTriggerEdit({ active: false, id: null, bom: {} }) }}
              />
            )}

            {filteredBom.length > 0 ? (
              <TableComponent
                rows={filteredBom}
                columns={columns}
                setTriggerEdit={setTriggerEdit}
                handleDeleteButton={handleDelete}
                view={view}
              />
            ) : (
              <p className="bom-empty-items">
                No BOM items for this stage yet.
              </p>
            )}
          </div>
        )}
      </div>

      <ImportBOMDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        targetProjectNumber={projectId}
        targetStageId={currentStageId}
      />
      <ImportBOMExcelDialog
        open={excelImportOpen}
        onClose={() => setExcelImportOpen(false)}
        projectNumber={projectId}
        stageId={currentStageId}
      />
    </div>
  )
}

export default BOMPage
