import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Paper, CircularProgress
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBom, importBomItems } from '../../../features/BOM.js'
import axios from 'axios'

const ImportBOMDialog = ({ open, onClose, targetProjectNumber, targetStageId }) => {
  const dispatch = useDispatch()
  const activeProjects = useSelector((state) => state.projects.activeProjects)

  const [sourceProject, setSourceProject] = useState('')
  const [sourceItems, setSourceItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const otherProjects = activeProjects.filter((p) => p.projectNumber != targetProjectNumber)

  useEffect(() => {
    if (!open) {
      setSourceProject('')
      setSourceItems([])
      setSelectedIds([])
    }
  }, [open])

  const handleProjectChange = async (e) => {
    const pn = e.target.value
    setSourceProject(pn)
    setSelectedIds([])
    if (!pn) { setSourceItems([]); return }

    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/bom/fetchBomDetails/${pn}`)
      setSourceItems(res.data?.data || [])
    } catch {
      setSourceItems([])
    }
    setLoading(false)
  }

  const toggleSelect = (bomId) => {
    setSelectedIds((prev) =>
      prev.includes(bomId) ? prev.filter((id) => id !== bomId) : [...prev, bomId]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === sourceItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sourceItems.map((i) => i.bomId))
    }
  }

  const handleImport = async () => {
    if (selectedIds.length === 0) return
    if (!targetStageId) {
      window.alert('Please select a target stage before importing BOM items.')
      return
    }

    setImporting(true)
    try {
      await dispatch(importBomItems({
        sourceProjectNumber: sourceProject,
        targetProjectNumber: targetProjectNumber,
        targetStageId: targetStageId,
        bomIds: selectedIds,
      })).unwrap()

      await dispatch(fetchBom(targetProjectNumber)).unwrap()
      onClose()
    } catch (error) {
      const message = error?.message || error?.error || 'Failed to import BOM items.'
      window.alert(message)
    } finally {
      setImporting(false)
    }
  }

  const cellSx = { fontSize: '13px', padding: '6px 10px' }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          border: '1px solid #d4e1ed',
          boxShadow: '0 16px 36px rgba(14,77,121,0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ fontSize: '17px', fontWeight: 700, color: '#173048', borderBottom: '1px solid #e3ecf5', backgroundColor: '#f6faff' }}>
        Import BOM Items from Another Project
      </DialogTitle>
      <DialogContent sx={{ pt: '16px !important', backgroundColor: '#fbfdff' }}>
        <TextField
          select
          label="Select Source Project"
          value={sourceProject}
          onChange={handleProjectChange}
          fullWidth
          size="small"
          sx={{
            mt: 1,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#fff',
            },
          }}
        >
          <MenuItem value="">-- Select --</MenuItem>
          {otherProjects.map((p) => (
            <MenuItem key={p.projectNumber} value={p.projectNumber}>
              {p.projectNumber} - {p.dieName} ({p.companyName})
            </MenuItem>
          ))}
        </TextField>

        {loading && <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />}

        {!loading && sourceItems.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 300, borderRadius: '10px', border: '1px solid #dbe6f2', boxShadow: 'none' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellSx} padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedIds.length === sourceItems.length}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < sourceItems.length}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', backgroundColor: '#edf5fc' }}>Item Name</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', backgroundColor: '#edf5fc' }}>Code</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', backgroundColor: '#edf5fc' }}>Spec</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', backgroundColor: '#edf5fc' }}>Material</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', backgroundColor: '#edf5fc' }}>Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sourceItems.map((item) => (
                  <TableRow key={item.bomId} hover>
                    <TableCell sx={cellSx} padding="checkbox">
                      <Checkbox size="small" checked={selectedIds.includes(item.bomId)} onChange={() => toggleSelect(item.bomId)} />
                    </TableCell>
                    <TableCell sx={cellSx}>{item.itemName}</TableCell>
                    <TableCell sx={cellSx}>{item.itemCode}</TableCell>
                    <TableCell sx={cellSx}>{item.specification || '-'}</TableCell>
                    <TableCell sx={cellSx}>{item.material || '-'}</TableCell>
                    <TableCell sx={cellSx}>{item.AQuantity || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && sourceProject && sourceItems.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No BOM items found in selected project.</p>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #e3ecf5', px: 2, py: 1.5, backgroundColor: '#f8fbff' }}>
        <Button onClick={onClose} size="small" sx={{ color: '#3b4e60' }}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          size="small"
          disabled={selectedIds.length === 0 || importing}
          sx={{
            background: 'linear-gradient(135deg, #0e4d79 0%, #2b6f99 100%)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
          }}
        >
          {importing ? 'Importing...' : `Import ${selectedIds.length} Item${selectedIds.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportBOMDialog
