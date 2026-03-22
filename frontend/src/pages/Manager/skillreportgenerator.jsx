import React, { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import logo from '../../assets/logo.png'
import { Modal, Box, Typography, Button } from '@mui/material'

// Skill Report Generator with professional layout matching ReportGenerator
const SkillReportGenerator = ({
  reportTitle = 'Skill Report',
  docNo,
  OriginDate,
  revNo,
  revDate,
  departmentName,
  departmentId,
  tableHeaders = [],
  tableData = [],
  onClose: onCloseProp,
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (tableData && tableData.length) generatePDF()
  }, [])

  const generatePDF = () => {
    try {
      const doc = new jsPDF({ format: 'a4' })

      let marginX = 10
      let marginY = 10
      let contentWidth = 190 // Full width with margins

      // **Draw Outer Page Border**
      doc.rect(marginX, marginY, contentWidth, 277) // A4 page height is 297mm

      // **Section 1: Logo & Company Name (Box Outline for Section & Elements)**
      doc.addImage(logo, 'PNG', marginX + 20, marginY + 3, 20, 20)
      doc.line(marginX, marginY + 25, marginX + 57, marginY + 25) // Company logo Box
      doc.setFontSize(13).setFont('helvetica', 'bold')
      doc.text('Aakar Foundry Pvt. Ltd.', marginX + 2, marginY + 30)
      doc.line(marginX, marginY + 33, marginX + 135, marginY + 33) // Horizontal line after Company Name
      doc.line(marginX + 57, marginY, marginX + 57, marginY + 33) // Vertical line after logo

      // **Section 2: Report Title (Centered, Box Outline)**
      let titleY = marginY + 3
      doc.setFontSize(16).setFont('helvetica', 'bold')
      doc.text(reportTitle, 105, titleY + 12, { align: 'center' })

      // **Section 3: Right-Side Document Info (Box Outline)**
      let rightX = marginX + 138
      doc.setFontSize(11).setFont('helvetica', 'bold')
      doc.text(`Doc. No: ${docNo || '—'}`, rightX, marginY + 5)
      doc.line(marginX + 135, marginY + 8, contentWidth + 10, marginY + 8)
      doc.text(`Origin Date: ${OriginDate || '—'}`, rightX, marginY + 13)
      doc.line(marginX + 135, marginY + 16, contentWidth + 10, marginY + 16)
      doc.text(`Rev No.: ${revNo || '—'}`, rightX, marginY + 21)
      doc.line(marginX + 135, marginY + 24, contentWidth + 10, marginY + 24)
      doc.text(`Rev Date: ${revDate || '—'}`, rightX, marginY + 30)
      doc.line(marginX + 135, marginY + 33, contentWidth + 10, marginY + 33)

      // **Vertical Line separating Document Info**
      doc.line(marginX + 135, marginY, marginX + 135, marginY + 68)

      // **Section 4: Department & Report Details (Box Outline)**
      doc.setFontSize(11).setFont('helvetica', 'bold')
      doc.text(`Department: ${departmentName || '—'}`, marginX + 2, marginY + 39)
      doc.line(marginX, marginY + 43, marginX + 135, marginY + 43)
      doc.text(`Dept ID: ${departmentId || '—'}`, marginX + 2, marginY + 48)
      doc.line(marginX, marginY + 51, marginX + 135, marginY + 51)

      // Get current date and time
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-IN')
      const timeStr = now.toLocaleTimeString('en-IN')
      doc.text(`Date: ${dateStr}`, marginX + 2, marginY + 57)
      doc.line(marginX, marginY + 60, marginX + 135, marginY + 60)
      doc.text(`Time: ${timeStr}`, marginX + 2, marginY + 65)
      doc.line(marginX, marginY + 68, contentWidth + 10, marginY + 68)

      // **Table Data**
      if (tableData && tableData.length > 0) {
        const tableDataWithSerialNo = tableData.map((item, index) => ({
          ...item,
          srNo: index + 1,
        }))

        doc.autoTable({
          startY: 85,
          head: [
            [
              'Sr No.',
              ...tableHeaders.map(header =>
                typeof header === 'string' ? header : header.label || header.name || JSON.stringify(header)
              ),
            ],
          ],
          body: tableDataWithSerialNo.map(item => [
            item.srNo,
            ...tableHeaders.map(header => {
              const key = typeof header === 'string' ? header : header.key || header.label
              return item[key] || ''
            }),
          ]),
          styles: {
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fontSize: 10,
            textColor: [0, 0, 0],
            fontStyle: 'normal',
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: false },
          theme: 'grid',
          margin: { top: 20, left: 10, right: 10, bottom: 20 },
          tableLineWidth: 0,
        })

        // **Signatures**
        let signStartY = doc.autoTable.previous.finalY + 10

        doc.text('Sign of Manager:                  ', marginX + 2, signStartY)
        signStartY += 15
        doc.text('Sign of HR:                       ', marginX + 2, signStartY)
        signStartY += 15
        doc.text('Sign of HOD:                      ', marginX + 2, signStartY)
      } else {
        doc.text('No records found', 10, 90)
      }

      const pdfData = doc.output('datauristring')
      setPdfDataUrl(pdfData)
      setPreviewOpen(true)
    } catch (err) {
      console.error('Error generating skill report PDF', err)
    }
  }

  const handleClose = () => {
    setPreviewOpen(false)
    setPdfDataUrl(null)
    // Notify parent to reset state so component can re-mount on next click
    if (onCloseProp) onCloseProp()
  }

  return (
    <div>
      <Modal open={previewOpen} onClose={handleClose}>
        <Box sx={{ width: '85%', margin: 'auto', mt: 5, backgroundColor: 'white', padding: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {reportTitle}
          </Typography>
          {pdfDataUrl ? (
            <iframe
              src={pdfDataUrl}
              width="100%"
              height="520px"
              title="Skill Report Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <Typography>Generating report...</Typography>
          )}
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Button onClick={handleClose} variant="outlined">
              Close
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default SkillReportGenerator
