import React, { useEffect, useState } from 'react'
import { TextField, Box } from '@mui/material'
import { IoIosSearch } from 'react-icons/io'
import TableComponent from '../Table/TableComponent.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { fetchActiveProjects } from '../../../features/projectSlice.js'
import "./BomProject.css"

const BomProject = () => {
  const dispatch = useDispatch()
  const { activeProjects } = useSelector((state) => state.projects)
  const [searchTerm, setSearchTerm] = useState('')

  const columns = [
    { label: 'Project Number', id: 'projectNumber', align: 'left' },
    { label: 'Company Name', id: 'companyName', align: 'left' },
    { label: 'Die Name', id: 'dieName', align: 'left' },
    { label: 'Status', id: 'projectStatus', align: 'left' },
    { label: 'Progress(%)', id: 'progress', align: 'left' },
  ]

  useEffect(() => {
    dispatch(fetchActiveProjects())
  }, [dispatch])

  const filteredProjects = activeProjects.filter((row) =>
    columns.some((col) => {
      const val = row[col.id]
      return val ? val.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
    })
  )

  return (
    <div className="bom-project-page">
      <div className="bom-project-header">
        <div>
          <h2 className="bom-project-title">BOM Project Directory</h2>
          <p className="bom-project-subtitle">Select a project to manage stage-wise bill of materials.</p>
        </div>
        <Box className="bom-project-search">
          <TextField
            label={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <IoIosSearch style={{ marginRight: '5px', fontSize: '18px' }} />
                Search
              </span>
            }
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '42px',
                fontSize: '14px',
                borderRadius: '10px',
                backgroundColor: '#fff',
              },
              '& .MuiInputLabel-root': { fontSize: '12px', top: '-5px' },
              width: 300,
            }}
          />
        </Box>
      </div>
      <div className="bom-project-stats">
        <span className="bom-project-stat-chip">Visible Projects: {filteredProjects.length}</span>
        <span className="bom-project-stat-chip bom-project-stat-chip-secondary">Total Active: {activeProjects.length}</span>
      </div>
      <TableComponent rows={filteredProjects} columns={columns} linkBasePath="/bom-project/bom" />
    </div>
  )
}

export default BomProject
