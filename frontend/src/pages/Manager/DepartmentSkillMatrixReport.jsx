import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assets/logo.png";
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from "@mui/material";
import dayjs from 'dayjs';

const DepartmentSkillMatrixReport = ({ 
  departmentName, 
  departmentId,
  employeeData, 
  selectedSkills, 
  onClose,
  docNo = 'DEPT-SKILL-MATRIX-001',
  OriginDate,
  revNo = '1.0',
  revDate
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Guard against invalid props
  const safeEmployeeData = Array.isArray(employeeData) ? employeeData : [];
  const safeSelectedSkills = Array.isArray(selectedSkills) ? selectedSkills : [];

  useEffect(() => {
    console.log("Employee Data:", employeeData);
    console.log("Selected Skills:", selectedSkills);
    generatePDF();
  }, [employeeData, selectedSkills]);

  // Helper function to get grade level info
  const getGradeLevel = (grade) => {
    const numGrade = parseInt(grade) || 0;
    const gradeLabels = {
      0: 'No Grade',
      1: 'Grade 1',
      2: 'Grade 2',
      3: 'Grade 3',
      4: 'Grade 4'
    };
    return { grade: numGrade, label: gradeLabels[numGrade] || gradeLabels[0] };
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF({ format: "a4" });
      let pageNumber = 1;
      let isFirstPage = true;

      // Helper function to draw 2x2 grade matrix squares
      const drawGradeMatrix = (gradeValue, x, y, cellWidth, cellHeight, docInstance) => {
        // Don't render empty matrix if no grade
        if (gradeValue <= 0) return;

        const squareSize = 4.5; // Unified square size
        const spacing = 1.2; // Unified spacing
        const totalSize = squareSize * 2 + spacing;

        // Center the matrix in the cell
        const startX = x + (cellWidth - totalSize) / 2;
        const startY = y + (cellHeight - totalSize) / 2;

        // Draw 2x2 matrix
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 2; col++) {
            const squareX = startX + col * (squareSize + spacing);
            const squareY = startY + row * (squareSize + spacing);
            const squareIndex = row * 2 + col + 1;

            const isFilled = squareIndex <= gradeValue;

            // Draw fill first, then border
            if (isFilled) {
              docInstance.setFillColor(59, 130, 246); // Blue fill
              docInstance.rect(squareX, squareY, squareSize, squareSize, 'F');
            }

            // Draw border on top
            docInstance.setDrawColor(0, 0, 0);
            docInstance.setLineWidth(0.3);
            docInstance.rect(squareX, squareY, squareSize, squareSize);
          }
        }
      };

      // Function to draw page header and footer
      const drawPageHeader = (docInstance, pageNum) => {
        const marginX = 10;
        const marginY = 10;
        const contentWidth = 190;

        // **Draw Outer Page Border**
        docInstance.rect(marginX, marginY, contentWidth, 277);

        // **Section 1: Logo & Company Name**
        try {
          docInstance.addImage(logo, "PNG", marginX + 20, marginY + 3, 20, 20);
        } catch (e) {
          console.warn("Logo image failed to load:", e);
        }
        docInstance.line(marginX, marginY + 25, marginX + 57, marginY + 25);
        docInstance.setFontSize(13).setFont("helvetica", "bold");
        docInstance.text("Aakar Foundry Pvt. Ltd.", marginX + 2, marginY + 30);
        docInstance.line(marginX, marginY + 33, marginX + 135, marginY + 33);
        docInstance.line(marginX + 57, marginY, marginX + 57, marginY + 33);

        // **Section 2: Report Title (Centered)**
        let titleY = marginY + 3;
        docInstance.setFontSize(16).setFont("helvetica", "bold");
        docInstance.text("Department Skill Matrix Report", 105, titleY + 12, { align: "center" });

        // **Section 3: Right-Side Document Info**
        let rightX = marginX + 138;
        docInstance.setFontSize(11).setFont("helvetica", "bold");
        docInstance.text(`Doc. No: ${docNo}`, rightX, marginY + 5);
        docInstance.line(marginX + 135, marginY + 8, contentWidth + 10, marginY + 8);
        docInstance.text(`Origin Date: ${OriginDate || dayjs().format('DD-MM-YYYY')}`, rightX, marginY + 13);
        docInstance.line(marginX + 135, marginY + 16, contentWidth + 10, marginY + 16);
        docInstance.text(`Rev No.: ${revNo}`, rightX, marginY + 21);
        docInstance.line(marginX + 135, marginY + 24, contentWidth + 10, marginY + 24);
        docInstance.text(`Rev Date: ${revDate || dayjs().format('DD-MM-YYYY')}`, rightX, marginY + 30);
        docInstance.line(marginX + 135, marginY + 33, contentWidth + 10, marginY + 33);

        // **Vertical Line separating Document Info**
        docInstance.line(marginX + 135, marginY, marginX + 135, marginY + 68);

        // **Section 4: Department Details (Simplified)**
        docInstance.setFontSize(11).setFont("helvetica", "bold");
        docInstance.text(`Department: ${departmentName || 'N/A'}`, marginX + 2, marginY + 39);
        docInstance.line(marginX, marginY + 42, marginX + 135, marginY + 42);
        docInstance.text(`Total Skills: ${safeSelectedSkills.length || 0}`, marginX + 2, marginY + 48);
        docInstance.line(marginX, marginY + 51, marginX + 135, marginY + 51);
        docInstance.text(`Generated Date: ${dayjs().format('DD-MM-YYYY HH:mm:ss')}`, marginX + 2, marginY + 57);
        docInstance.line(marginX, marginY + 60, contentWidth + 10, marginY + 60);

        return marginY + 65; // Return starting Y for content (reduced from 85)
      };

      // Generate a page for each employee
      safeEmployeeData.forEach((employee, employeeIndex) => {
        if (!isFirstPage) {
          doc.addPage();
          pageNumber++;
        }
        isFirstPage = false;

        const startY = drawPageHeader(doc, pageNumber);

        // **Employee Name and ID**
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(`Employee: ${employee.employeeName || 'N/A'} (ID: ${employee.employeeId || 'N/A'})`, 10, startY);
        doc.line(10, startY + 3, 200, startY + 3);

        // **Qualifications and Experience (Styled with spacing)**
        doc.setFontSize(11).setFont("helvetica", "bold");
        doc.text(`Qualifications: ${employee.employeeQualification || 'N/A'}`, 10, startY + 8);
        doc.line(10, startY + 11, 200, startY + 11);
        doc.text(`Experience (Years): ${employee.experienceInYears || 'N/A'}`, 10, startY + 16);
        doc.line(10, startY + 19, 200, startY + 19);

        // **Skill Matrix Table for this employee**
        if (safeSelectedSkills.length > 0) {
          const tableData = [];

          safeSelectedSkills.forEach((skill, skillIndex) => {
            // Find the grade for this skill in the employee data
            let grade = 0;
            let skillId = skill.id;

            if (employee.skills && employee.skills[skillId]) {
              grade = employee.skills[skillId] || 0;
            }

            const gradeInfo = getGradeLevel(grade);

            tableData.push([
              (skillIndex + 1).toString(),
              { content: skill.label, styles: { fontSize: 10, fontStyle: 'normal' } },
              { content: '', styles: { fontSize: 9, halign: 'center', valign: 'middle' }, gradeValue: gradeInfo.grade },
            ]);
          });

          doc.autoTable({
            startY: startY + 16,
            head: [["Sr No.", "Skill Name", "Grade Matrix"]],
            body: tableData,
            styles: {
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fontSize: 9,
              textColor: [0, 0, 0],
              cellPadding: 3,
              minCellHeight: 12,
            },
            headStyles: {
              fillColor: [200, 200, 200],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 10,
            },
            alternateRowStyles: { fillColor: false },
            columnStyles: {
              0: { halign: 'center', cellWidth: 15 },
              1: { halign: 'left', cellWidth: 135 },
              2: { halign: 'center', cellWidth: 40 },
            },
            theme: "grid",
            margin: { top: 15, left: 10, right: 10, bottom: 25 },
            tableLineWidth: 0.1,
            didDrawCell: (data) => {
              if (data.column.index === 2 && data.row.index !== -1) {
                const gradeValue = data.row?.raw?.[2]?.gradeValue ?? 0;
                drawGradeMatrix(gradeValue, data.cell.x, data.cell.y, data.cell.width, data.cell.height, doc);
              }
            },
          });

          // **Signatures**
          let signStartY = doc.autoTable.previous.finalY + 10;

          doc.setFontSize(11).setFont("helvetica", "bold");
          doc.text("Employee Sign:                  ", 10, signStartY);
          signStartY += 15;
          doc.text("Manager Sign:                   ", 10, signStartY);
          signStartY += 15;
          doc.text("HR Sign:                        ", 10, signStartY);
        } else {
          doc.setFontSize(10).setFont("helvetica", "normal");
          doc.text("No skills selected for this report.", 10, startY + 22);
        }
      });

      const pdfData = doc.output('datauristring');
      setPdfDataUrl(pdfData);
      setLoading(false);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ format: "a4" });
      let pageNumber = 1;
      let isFirstPage = true;

      const drawGradeMatrix = (gradeValue, x, y, cellWidth, cellHeight, docInstance) => {
        if (gradeValue <= 0) return;

        const squareSize = 4.5;
        const spacing = 1.2;
        const totalSize = squareSize * 2 + spacing;

        const startX = x + (cellWidth - totalSize) / 2;
        const startY = y + (cellHeight - totalSize) / 2;

        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 2; col++) {
            const squareX = startX + col * (squareSize + spacing);
            const squareY = startY + row * (squareSize + spacing);
            const squareIndex = row * 2 + col + 1;

            const isFilled = squareIndex <= gradeValue;

            if (isFilled) {
              docInstance.setFillColor(59, 130, 246);
              docInstance.rect(squareX, squareY, squareSize, squareSize, 'F');
            }

            docInstance.setDrawColor(0, 0, 0);
            docInstance.setLineWidth(0.3);
            docInstance.rect(squareX, squareY, squareSize, squareSize);
          }
        }
      };

      const drawPageHeader = (docInstance, pageNum) => {
        const marginX = 10;
        const marginY = 10;
        const contentWidth = 190;

        docInstance.rect(marginX, marginY, contentWidth, 277);

        try {
          docInstance.addImage(logo, "PNG", marginX + 20, marginY + 3, 20, 20);
        } catch (e) {
          console.warn("Logo image failed to load:", e);
        }

        docInstance.line(marginX, marginY + 25, marginX + 57, marginY + 25);
        docInstance.setFontSize(13).setFont("helvetica", "bold");
        docInstance.text("Aakar Foundry Pvt. Ltd.", marginX + 2, marginY + 30);
        docInstance.line(marginX, marginY + 33, marginX + 135, marginY + 33);
        docInstance.line(marginX + 57, marginY, marginX + 57, marginY + 33);

        let titleY = marginY + 3;
        docInstance.setFontSize(16).setFont("helvetica", "bold");
        docInstance.text("Department Skill Matrix Report", 105, titleY + 12, { align: "center" });

        let rightX = marginX + 138;
        docInstance.setFontSize(11).setFont("helvetica", "bold");
        docInstance.text(`Doc. No: ${docNo}`, rightX, marginY + 5);
        docInstance.line(marginX + 135, marginY + 8, contentWidth + 10, marginY + 8);
        docInstance.text(`Origin Date: ${OriginDate || dayjs().format('DD-MM-YYYY')}`, rightX, marginY + 13);
        docInstance.line(marginX + 135, marginY + 16, contentWidth + 10, marginY + 16);
        docInstance.text(`Rev No.: ${revNo}`, rightX, marginY + 21);
        docInstance.line(marginX + 135, marginY + 24, contentWidth + 10, marginY + 24);
        docInstance.text(`Rev Date: ${revDate || dayjs().format('DD-MM-YYYY')}`, rightX, marginY + 30);
        docInstance.line(marginX + 135, marginY + 33, contentWidth + 10, marginY + 33);

        docInstance.line(marginX + 135, marginY, marginX + 135, marginY + 68);

        docInstance.setFontSize(11).setFont("helvetica", "bold");
        docInstance.text(`Department: ${departmentName || 'N/A'}`, marginX + 2, marginY + 39);
        docInstance.line(marginX, marginY + 42, marginX + 135, marginY + 42);
        docInstance.text(`Total Skills: ${safeSelectedSkills.length || 0}`, marginX + 2, marginY + 48);
        docInstance.line(marginX, marginY + 51, marginX + 135, marginY + 51);
        docInstance.text(`Generated Date: ${dayjs().format('DD-MM-YYYY HH:mm:ss')}`, marginX + 2, marginY + 57);
        docInstance.line(marginX, marginY + 60, contentWidth + 10, marginY + 60);

        return marginY + 65;
      };

      safeEmployeeData.forEach((employee) => {
        if (!isFirstPage) {
          doc.addPage();
          pageNumber++;
        }
        isFirstPage = false;

        const startY = drawPageHeader(doc, pageNumber);

        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(`Employee: ${employee.employeeName || 'N/A'} (ID: ${employee.employeeId || 'N/A'})`, 10, startY);
        doc.line(10, startY + 3, 200, startY + 3);

        // **Qualifications and Experience (Styled with spacing)**
        doc.setFontSize(11).setFont("helvetica", "bold");
        doc.text(`Qualifications: ${employee.employeeQualification || 'N/A'}`, 10, startY + 8);
        doc.line(10, startY + 11, 200, startY + 11);
        doc.text(`Experience (Years): ${employee.experienceInYears || 'N/A'}`, 10, startY + 16);
        doc.line(10, startY + 19, 200, startY + 19);

        if (safeSelectedSkills.length > 0) {
          const tableData = [];

          safeSelectedSkills.forEach((skill, skillIndex) => {
            let grade = 0;
            let skillId = skill.id;

            if (employee.skills && employee.skills[skillId]) {
              grade = employee.skills[skillId] || 0;
            }

            const gradeInfo = getGradeLevel(grade);

            tableData.push([
              (skillIndex + 1).toString(),
              { content: skill.label, styles: { fontSize: 10, fontStyle: 'normal' } },
              { content: '', styles: { fontSize: 9, halign: 'center', valign: 'middle' }, gradeValue: gradeInfo.grade },
            ]);
          });

          doc.autoTable({
            startY: startY + 22,
            head: [["Sr No.", "Skill Name", "Grade Matrix"]],
            body: tableData,
            styles: {
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
              fontSize: 9,
              textColor: [0, 0, 0],
              cellPadding: 3,
              minCellHeight: 12,
            },
            headStyles: {
              fillColor: [200, 200, 200],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 10,
            },
            alternateRowStyles: { fillColor: false },
            columnStyles: {
              0: { halign: 'center', cellWidth: 15 },
              1: { halign: 'left', cellWidth: 135 },
              2: { halign: 'center', cellWidth: 40 },
            },
            theme: "grid",
            margin: { top: 20, left: 10, right: 10, bottom: 20 },
            tableLineWidth: 0.1,
            didDrawCell: (data) => {
              if (data.column.index === 2 && data.row.index !== -1) {
                const gradeValue = data.row?.raw?.[2]?.gradeValue ?? 0;
                drawGradeMatrix(gradeValue, data.cell.x, data.cell.y, data.cell.width, data.cell.height, doc);
              }
            },
          });

          let signStartY = doc.autoTable.previous.finalY + 10;

          doc.setFontSize(11).setFont("helvetica", "bold");
          doc.text("Employee Sign:                  ", 10, signStartY);
          signStartY += 15;
          doc.text("Manager Sign:                   ", 10, signStartY);
          signStartY += 15;
          doc.text("HR Sign:                        ", 10, signStartY);
        }
      });

      doc.save(`DepartmentSkillMatrix_${departmentName}_${dayjs().format("DD_MM_YYYY")}.pdf`);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    onClose?.();
  };

  if (loading) {
    return (
      <Modal open={true}>
        <Box sx={{ width: "100%", height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(0,0,0,0.7)" }}>
          <Typography sx={{ color: 'white', fontSize: 20 }}>Generating Report...</Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <div>
      <Modal
        open={previewOpen}
        onClose={handleClosePreview}
        aria-labelledby="pdf-preview-title"
      >
        <Box sx={{ width: "85%", margin: "auto", mt: 5, backgroundColor: "white", padding: 2, borderRadius: 2, maxHeight: '90vh', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Department Skill Matrix Report - PDF Preview
          </Typography>

          {pdfDataUrl ? (
            <>
              <iframe
                src={pdfDataUrl}
                width="100%"
                height="600"
                title="PDF Preview"
                style={{ border: 'none', marginBottom: 20 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleDownloadPDF}>
                  Download PDF
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleClosePreview}>
                  Close
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Failed to generate PDF</Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default DepartmentSkillMatrixReport;
