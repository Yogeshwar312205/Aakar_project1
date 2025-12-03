import React, { useState, useEffect } from 'react'
import {
  Box,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import downloadasexcel from '../../assets/downlaodasexcel.svg'
import downloadaspdf from '../../assets/downlaodaspdf.svg'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './TableComponent.css'
import Searchbar from '../../components/Searchbox/Searchbar.jsx'
import { FiDownload } from 'react-icons/fi'

const TableComponent = ({
  rows,
  columns,
  linkBasePath,
  defaultSortOrder = 'newest',
  itemKey,
  itemLabel,
  navigateTo,
  searchLabel,
}) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState(
    defaultSortOrder === 'newest' ? 'desc' : 'asc'
  ) // Default order based on prop
  const [orderBy, setOrderBy] = useState('createdAt') // Sort by 'createdAt' by default
  const [anchorEl, setAnchorEl] = useState(null)
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null)
  const [sortedRows, setSortedRows] = useState([])

  // Sync sortedRows with rows whenever rows prop changes, and apply default sorting
  useEffect(() => {
    const sorted = [...rows].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return defaultSortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
    setSortedRows(sorted)
  }, [rows, defaultSortOrder])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    const newOrder = isAsc ? 'desc' : 'asc'
    setOrder(newOrder)
    setOrderBy(property)

    // Apply sorting to sortedRows
    const sorted = [...sortedRows].sort(getComparator(newOrder, property))
    setSortedRows(sorted)
  }

  const descendingComparator = (a, b, property) => {
    if (!a[property]) return 1
    if (!b[property]) return -1
    if (a[property] < b[property]) return -1
    if (a[property] > b[property]) return 1
    return 0
  }

  const getComparator = (order, property) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(b, a, property)
      : (a, b) => descendingComparator(a, b, property)
  }

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSortByCreatedAt = (order) => {
    const sorted = [...rows].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return order === 'newest' ? dateB - dateA : dateA - dateB
    })
    setSortedRows(sorted)
    setSortMenuAnchorEl(null)
  }

  const exportToExcel = (rows) => {
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, 'data.xlsx')
  }

  const exportToPDF = (rows) => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [columns.map((col) => col.label)],
      body: rows.map((row) => columns.map((col) => row[col.id])),
    })
    doc.save('data.pdf')
  }

  const downloadFile = (type) => {
    type === 'excel' ? exportToExcel(sortedRows) : exportToPDF(sortedRows)
    handleClose()
  }

  return (
    <Box>
      <div
        className="flex items-center justify-between"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Searchbar
          items={sortedRows}
          itemKey={itemKey}
          itemLabel={itemLabel}
          navigateTo={navigateTo}
          searchLabel={searchLabel}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* SortBy Button */}
          <div
            className="hover:cursor-pointer border-2 border-[#0061A1] rounded px-4 py-1.5 font-semibold text-[#0061A1] flex justify-between items-center gap-3"
            onClick={(event) => setSortMenuAnchorEl(event.currentTarget)}
          >
            <FiDownload />
            <p>Sort By</p>
          </div>
          <Menu
            anchorEl={sortMenuAnchorEl}
            open={Boolean(sortMenuAnchorEl)}
            onClose={() => setSortMenuAnchorEl(null)}
          >
            <MenuItem onClick={() => handleSortByCreatedAt('newest')}>
              Newest First
            </MenuItem>
            <MenuItem onClick={() => handleSortByCreatedAt('oldest')}>
              Oldest First
            </MenuItem>
          </Menu>

          {/* Download Button */}
          <div
            className="hover:cursor-pointer border-2 border-[#0061A1] rounded px-4 py-1.5 font-semibold text-[#0061A1] flex justify-between items-center gap-3"
            onClick={handleDownloadClick}
          >
            <FiDownload />
            <p>Download</p>
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => downloadFile('excel')}>
              <img src={downloadasexcel} alt="Excel" />
              Excel
            </MenuItem>
            <MenuItem onClick={() => downloadFile('pdf')}>
              <img src={downloadaspdf} alt="PDF" />
              PDF
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* Table Section */}
      <Paper className="table-container">
        <TableContainer className="custom-scrollbar">
          <Table aria-label="data table">
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    color: '#0061A1',
                    fontWeight: 'bold',
                    textAlign: 'left',
                  }}
                  align="left"
                >
                  Sr. No.
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sortDirection={orderBy === column.id ? order : false}
                    style={{
                      color: '#0061A1', // Text color
                      fontWeight: 'bold', // Makes it bold
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const RowComponent = linkBasePath ? Link : 'tr'
                  const rowProps = linkBasePath
                    ? {
                        component: RowComponent,
                        to: `${linkBasePath}/${
                          row.empId || row.deptId || row.projectId || row.designId
                        }`,
                        sx: {
                          cursor: 'pointer',
                          textDecoration: 'none',
                        },
                      }
                    : { component: 'tr' }

                  return (
                    <TableRow key={uuidv4()} {...rowProps}>
                      <TableCell align="left">
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {row[column.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  )
}

export default TableComponent
