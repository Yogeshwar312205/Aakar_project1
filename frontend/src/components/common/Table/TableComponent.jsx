import React, { useState, useMemo, useCallback } from 'react'
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Typography,
  Box,
  Menu,
  MenuItem,
  TablePagination,
  TableSortLabel,
  IconButton,
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiEdit2 } from 'react-icons/fi'
import { FaRegClock } from 'react-icons/fa'
import { RiDeleteBinLine } from 'react-icons/ri'
import {
  deleteProject,
  fetchHistoryProjects,
} from '../../../features/projectSlice'
import {
  fetchHistoryStagesByStageId,
  fetchActiveStagesByProjectNumber,
  deleteStage,
} from '../../../features/stageSlice'
import { formatDate, formatTimeDate } from '../../common/functions/formatDate'
import LinearProgress from '@mui/material/LinearProgress'
import './TableComponent.css'
import {
  deleteSubStage,
  getHistorySubStagesBySubStageId,
} from '../../../features/subStageSlice'
import downloadasexcel from '../../../assets/downlaodasexcel.svg'
import downloadaspdf from '../../../assets/downlaodaspdf.svg'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { FiDownload } from 'react-icons/fi'
import { IoIosSearch } from 'react-icons/io'

const TableComponent = ({
  whose,
  rows,
  columns,
  linkBasePath,
  optionLinkBasePath,
}) => {
  const { user } = useSelector((state) => state.auth)
  console.log({ user: user })
  const employeeAccess = useSelector(
    (state) => state.auth.user?.employeeAccess
  ).split(',')[1]
  console.log({ employeeAccess: employeeAccess })
  const accessSegment1 = employeeAccess.substring(1, 5)
  const accessSegment2 = employeeAccess.substring(5, 9)
  const accessSegment3 = employeeAccess.substring(9, 13)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')
  const [openIndex, setOpenIndex] = useState(null)

  const historyData1 = useSelector((state) => {
    switch (whose) {
      case 'project':
        return state.projects.historyProjects
      case 'stage':
        return state.stages.historyStages
      case 'substage':
        return state.substages.historySubStages
      default:
        return []
    }
  })

  const [anchorEl, setAnchorEl] = useState(null)
  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
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
  const historyData = useMemo(
    () =>
      historyData1.map((row) => ({
        ...row,
        startDate: formatDate(row.startDate),
        endDate: formatDate(row.endDate),
      })),
    [historyData1]
  )

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }, [])

  const handleRequestSort = useCallback(
    (property) => {
      const isAsc = orderBy === property && order === 'asc'
      setOrder(isAsc ? 'desc' : 'asc')
      setOrderBy(property)
    },
    [order, orderBy]
  )

  const getComparator = useCallback((order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }, [])

  const descendingComparator = useCallback((a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1
    if (b[orderBy] > a[orderBy]) return 1
    return 0
  }, [])

  const stableSort = useCallback((array, comparator) => {
    const stabilizedArray = array.map((el, index) => [el, index])
    stabilizedArray.sort((a, b) => {
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedArray.map((el) => el[0])
  }, [])

  const handleRowClick = useCallback(
    (clickIndex, row) => {
      if (whose === 'project') {
        dispatch(fetchHistoryProjects(row.projectNumber))
      } else if (whose === 'stage') {
        dispatch(fetchHistoryStagesByStageId(row.stageId))
      } else if (whose === 'substage') {
        dispatch(getHistorySubStagesBySubStageId(row.substageId))
      }

      setOpenIndex((prevIndex) =>
        prevIndex === clickIndex ? null : clickIndex
      )
    },
    [dispatch, whose]
  )

  const handleDelete = useCallback(
    (row) => {
      const id =
        whose === 'project'
          ? row.projectNumber
          : whose === 'stage'
          ? row.stageId
          : whose === 'substage'
          ? row.substageId
          : ''
      const confirmMessage =
        whose === 'project'
          ? `Are you sure you want to delete project "${row.projectNumber}"?`
          : whose === 'stage'
          ? `Are you sure you want to delete stage "${row.stageName}"?`
          : whose === 'substage'
          ? `Are you sure you want to delete substage "${row.stageName}"?`
          : ''
      if (window.confirm(confirmMessage)) {
        whose === 'project'
          ? dispatch(deleteProject(id))
          : whose == 'stage'
          ? dispatch(deleteStage(id))
          : whose === 'substage'
          ? dispatch(deleteSubStage(id))
          : ''
      }
    },
    [dispatch]
  )
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.some((column) => {
        const value = row[column.id]
        return value
          ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          : false
      })
    )
  }, [rows, columns, searchTerm])
  const sortedRows = useMemo(() => {
    return stableSort(filteredRows, getComparator(order, orderBy))
  }, [filteredRows, stableSort, getComparator, order, orderBy])

  const paginatedRows = useMemo(() => {
    return sortedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [sortedRows, page, rowsPerPage])

  return (
    <>
      <div
        className="flex items-center justify-between w-[100%]"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box p={2}>
          <TextField
            label={
              <span className="flex justify-center items-center">
                <IoIosSearch style={{ marginRight: '5px', fontSize: '19px' }} />
                Search
              </span>
            }
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            placeholder="Search by any field..."
            className=" w-[250px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '45px', // Adjust the input field height
                fontSize: '14px', // Adjust font size for better alignment
              },
              '& .MuiInputLabel-root': {
                fontSize: '12px', // Adjust label font size if needed
                top: '-4px', // Adjust the label position
              },
            }}
          />
        </Box>
        <div>
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
      <Paper className="table-container">
        <TableContainer
          className={`custom-scrollbar ${whose == 'project' ? 'project' : ''}`}
        >
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
                <TableCell
                  align="center"
                  style={{
                    color: '#0061A1', // Text color
                    fontWeight: 'bold', // Makes it bold
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, index) => {
                const rowIndex = page * rowsPerPage + index
                return (
                  <React.Fragment key={row.id || rowIndex}>
                    <TableRow
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      <TableCell
                        align="left"
                        component={linkBasePath ? Link : 'td'}
                        to={
                          linkBasePath
                            ? `${linkBasePath}/${
                                row.empId || row.deptId || row.projectNumber
                              }
                            }`
                            : undefined
                        }
                      >
                        {rowIndex + 1}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          component={linkBasePath ? Link : 'td'}
                          to={
                            linkBasePath
                              ? `${linkBasePath}/${
                                  row.stageId || row.projectNumber
                                }`
                              : undefined
                          }
                          align={column.align}
                        >
                          <p
                            className={
                              row[column.id] === 'Completed'
                                ? 'completed'
                                : row[column.id] === 'Overdue'
                                ? 'overdue'
                                : row[column.id] === 'Pending'
                                ? 'pending'
                                : ''
                            }
                          >
                            {row[column.id]}
                            {column.id == 'progress' ? '%' : ''}
                          </p>
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          fontFamily: 'Inter, sans-serif',
                          cursor: 'pointer',
                          paddingLeft: '0',
                          paddingRight: '0',
                          padding: '0',
                        }}
                      >
                        {console.log({ row: row })}
                        {((employeeAccess[3] == '1' ||
                          employeeAccess[5] == '1') &&
                          whose == 'project') ||
                        ((employeeAccess[7] == '1' ||
                          employeeAccess[9] == '1' ||
                          employeeAccess[11] == '1') &&
                          whose == 'stage')
                          ? whose !== 'substage' && (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(
                                    optionLinkBasePath
                                      ? `${optionLinkBasePath}/${
                                          row.stageId || row.projectNumber
                                        }`
                                      : undefined
                                  )
                                }}
                              >
                                <FiEdit2 className="option-icon" />
                              </IconButton>
                            )
                          : ''}
                        {(accessSegment1 === '1111' && whose == 'project') ||
                        (accessSegment2 === '1111' && whose == 'stage') ||
                        (accessSegment3 === '1111' && whose == 'substage') ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(rowIndex, row)
                            }}
                          >
                            <FaRegClock className="option-icon" />
                          </IconButton>
                        ) : (
                          ''
                        )}
                        {(employeeAccess[4] == '1' && whose == 'project') ||
                        (employeeAccess[8] == '1' && whose == 'stage') ||
                        (employeeAccess[12] == '1' && whose == 'substage') ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(row)
                            }}
                          >
                            <RiDeleteBinLine className="option-icon" />
                          </IconButton>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className="historyOfStages">
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={columns.length + 2}
                      >
                        <Collapse
                          in={openIndex === rowIndex} // Use the single openIndex
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Typography variant="h6" gutterBottom>
                              {whose === 'substage'
                                ? 'Substage '
                                : whose === 'stage'
                                ? 'Stage '
                                : whose === 'project'
                                ? 'Project '
                                : ''}{' '}
                              History
                            </Typography>
                            {historyData &&
                            historyData.filter((data) =>
                              whose == 'project'
                                ? data.historyOf == row.projectNumber
                                : whose == 'stage'
                                ? data.historyOf == row.stageId
                                : whose == 'substage'
                                ? data.historyOf == row.substageId
                                : ''
                            ).length > 0 ? (
                              <table className="history-table">
                                <thead>
                                  <tr>
                                    {columns
                                      .filter(
                                        (column) =>
                                          column.id !== 'projectNumber'
                                      )
                                      .map((column) => (
                                        <td
                                          key={column.id}
                                          align={column.align}
                                        >
                                          {column.label}
                                        </td>
                                      ))}
                                    <td>Update Reason</td>
                                    <td>Updated At</td>
                                  </tr>
                                </thead>
                                <tbody>
                                  {historyData
                                    .filter((data) =>
                                      whose == 'project'
                                        ? data.historyOf == row.projectNumber
                                        : whose == 'stage'
                                        ? data.historyOf == row.stageId
                                        : whose == 'substage'
                                        ? data.historyOf == row.substageId
                                        : ''
                                    )
                                    .map((historyRow, historyIndex) => (
                                      <tr key={historyRow.id || historyIndex}>
                                        {columns
                                          .filter(
                                            (column) =>
                                              column.id !== 'projectNumber'
                                          )
                                          .map((column) => (
                                            <td
                                              key={column.id}
                                              align={column.align}
                                            >
                                              {historyRow[column.id]}

                                              {column.id == 'progress'
                                                ? '%'
                                                : ''}
                                            </td>
                                          ))}
                                        <td>{historyRow.updateReason}</td>
                                        <td>
                                          {formatDate(historyRow.timestamp)},{' '}
                                          {formatTimeDate(historyRow.timestamp)}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            ) : (
                              <Typography>No history found.</Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

export default TableComponent
