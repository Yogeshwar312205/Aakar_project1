import React, { useState, useEffect } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { importBomFromExcel, fetchBom } from '../../../features/BOM.js'
import * as XLSX from 'xlsx'
import './ImportBOMExcelDialog.css'

const ImportBOMExcelDialog = ({ open, onClose, projectNumber, stageId }) => {
    const dispatch = useDispatch()

    const [file, setFile] = useState(null)
    const [fileName, setFileName] = useState('')
    const [previewData, setPreviewData] = useState([])
    const [validationErrors, setValidationErrors] = useState([])
    const [importing, setImporting] = useState(false)
    const [importStatus, setImportStatus] = useState(null) // 'success' or 'error'
    const [importMessage, setImportMessage] = useState('')
    const [step, setStep] = useState('upload') // 'upload', 'preview', 'importing', 'complete'

    useEffect(() => {
        if (!open) {
            resetDialog()
        }
    }, [open])

    const resetDialog = () => {
        setFile(null)
        setFileName('')
        setPreviewData([])
        setValidationErrors([])
        setImporting(false)
        setImportStatus(null)
        setImportMessage('')
        setStep('upload')
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            processFile(selectedFile)
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDrop = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const droppedFile = event.dataTransfer.files?.[0]
        if (droppedFile) {
            processFile(droppedFile)
        }
    }

    const processFile = (fileToProcess) => {
        const validExtensions = ['xlsx', 'xls']
        const fileExtension = fileToProcess.name.split('.').pop().toLowerCase()

        if (!validExtensions.includes(fileExtension)) {
            setValidationErrors(['Only .xlsx and .xls files are supported'])
            setStep('upload')
            return
        }

        if (fileToProcess.size > 5 * 1024 * 1024) {
            setValidationErrors(['File size must be less than 5MB'])
            setStep('upload')
            return
        }

        setFile(fileToProcess)
        setFileName(fileToProcess.name)
        setValidationErrors([])
        handlePreview(fileToProcess)
    }

    const handlePreview = (fileToPreview) => {
        try {
            const reader = new FileReader()
            reader.onload = (event) => {
                const workbook = XLSX.read(event.target.result, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const data = XLSX.utils.sheet_to_json(worksheet)

                if (!data || data.length === 0) {
                    setValidationErrors(['Excel file is empty'])
                    setStep('upload')
                    return
                }

                if (data.length > 150) {
                    setValidationErrors([`Cannot import more than 150 items. Found ${data.length} items.`])
                    setStep('upload')
                    return
                }

                setPreviewData(data)
                setValidationErrors([])
                setStep('preview')
            }
            reader.readAsArrayBuffer(fileToPreview)
        } catch (error) {
            setValidationErrors([`Error reading file: ${error.message}`])
            setStep('upload')
        }
    }

    const handleImport = async () => {
        if (!file) {
            setValidationErrors(['Please select a file first'])
            return
        }

        setImporting(true)
        setStep('importing')

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('projectNumber', projectNumber)
            formData.append('stageId', stageId)

            const response = await dispatch(importBomFromExcel(formData)).unwrap()

            // Refresh BOM data
            await dispatch(fetchBom(projectNumber))

            setImportStatus('success')
            setImportMessage(`Successfully imported ${response.data?.imported || 0} items`)
            setStep('complete')
            setImporting(false)
        } catch (error) {
            setImporting(false)
            setImportStatus('error')

            const errors = error.errors || error.data?.errors;
            if (errors && Array.isArray(errors)) {
                setValidationErrors(errors)
                setImportMessage('Validation failed. Please check the errors below.')
            } else {
                setImportMessage(error.message || 'Failed to import items')
            }

            setStep('preview')
        }
    }

    const getPreviewColumns = () => {
        if (previewData.length === 0) return []
        const firstRow = previewData[0]
        return Object.keys(firstRow).slice(0, 10) // Show first 10 columns
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
            <DialogTitle
                sx={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#173048',
                    borderBottom: '1px solid #e3ecf5',
                    backgroundColor: '#f6faff',
                }}
            >
                Import BOM Items from Excel
            </DialogTitle>

            <DialogContent sx={{ pt: '16px !important', backgroundColor: '#fbfdff' }}>
                {/* Upload Step */}
                {step === 'upload' && (
                    <Box className="excel-upload-zone">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="excel-file-input"
                        />
                        <label
                            htmlFor="excel-file-input"
                            className="upload-box"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <Typography variant="h6" sx={{ mb: 1, color: '#173048' }}>
                                📁 Drag & Drop Excel File
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#5a7a8a', mb: 2 }}>
                                or click to select file (.xlsx, .xls)
                            </Typography>
                            <Button variant="outlined" size="small" sx={{ pointerEvents: 'none' }}>
                                Choose File
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#8a9aaa' }}>
                                Max file size: 5MB | Max items: 150
                            </Typography>
                        </label>

                        {fileName && (
                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                                    ✓ File selected: {fileName}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Preview Step */}
                {(step === 'preview' || step === 'complete') && previewData.length > 0 && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#173048' }}>
                            Preview ({previewData.length} items)
                        </Typography>

                        <TableContainer
                            sx={{
                                maxHeight: '300px',
                                border: '1px solid #d4e1ed',
                                borderRadius: '8px',
                                mb: 2,
                            }}
                        >
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f0f5fa' }}>
                                        {getPreviewColumns().map((col) => (
                                            <TableCell key={col} sx={{ fontSize: '12px', fontWeight: 600 }}>
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.slice(0, 5).map((row, idx) => (
                                        <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9fbfd' } }}>
                                            {getPreviewColumns().map((col) => (
                                                <TableCell key={col} sx={{ fontSize: '12px', py: 1 }}>
                                                    {row[col] !== null && row[col] !== undefined
                                                        ? String(row[col]).slice(0, 30)
                                                        : '-'}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {previewData.length > 5 && (
                            <Typography variant="caption" sx={{ color: '#8a9aaa' }}>
                                Showing 5 of {previewData.length} items...
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Errors Display */}
                {validationErrors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {importMessage || 'Please fix the following errors:'}
                        </Alert>
                        <Box
                            sx={{
                                backgroundColor: '#ffebee',
                                border: '1px solid #ffcdd2',
                                borderRadius: '8px',
                                maxHeight: '150px',
                                overflowY: 'auto',
                                p: 1.5,
                            }}
                        >
                            {validationErrors.map((error, idx) => (
                                <Typography key={idx} variant="caption" sx={{ display: 'block', color: '#c62828', mb: 0.5 }}>
                                    • {error}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Success Message */}
                {step === 'complete' && importStatus === 'success' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {importMessage}
                    </Alert>
                )}

                {/* Importing Progress */}
                {step === 'importing' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                        <CircularProgress sx={{ mr: 2 }} />
                        <Typography sx={{ color: '#173048' }}>Importing items...</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e3ecf5', backgroundColor: '#f6faff' }}>
                <Button onClick={onClose} disabled={importing} sx={{ color: '#5a7a8a' }}>
                    {step === 'complete' ? 'Close' : 'Cancel'}
                </Button>
                {step === 'upload' && fileName && (
                    <Button
                        onClick={() => handlePreview(file)}
                        variant="outlined"
                        disabled={!file}
                        sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
                        }}
                    >
                        Preview
                    </Button>
                )}
                {step === 'upload' && fileName && (
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        disabled={!file || importing}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' },
                        }}
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </Button>
                )}
                {step === 'preview' && validationErrors.length === 0 && (
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        disabled={importing}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' },
                        }}
                    >
                        {importing ? 'Importing...' : 'Import'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default ImportBOMExcelDialog
