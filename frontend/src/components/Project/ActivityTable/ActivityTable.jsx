import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
} from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import Checkbox from '@mui/material/Checkbox'
import './ActivityTable.css'

const ActivityTable = ({ rows, columns, setRows, onActivitySelect }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
  }

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  const descendingComparator = (a, b, orderBy) => {
    if (a[orderBy] === undefined || b[orderBy] === undefined) {
      return 0
    }
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }

  const handleCheckboxChange = (rowId, activityId) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          // Find the activity details from the columns array
          const activityDetails = columns.find(
            (column) => column.id === activityId
          )

          // Check if the activity is already in the row's activities list
          const isActivityIncluded = row.activities.some(
            (activity) => activity.id === activityId
          )

          // Notify the parent component about the selected activity
          if (!isActivityIncluded) {
            onActivitySelect(activityDetails)
          }

          return {
            ...row,
            activities: isActivityIncluded
              ? row.activities.filter((activity) => activity.id !== activityId) // Remove activity
              : [...row.activities, activityDetails], // Add activity details
          }
        }
        return row
      })
    )
  }

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } }

  return (
    <Paper className="TableComponent-table-container">
      <TableContainer className="TableComponent-custom-scrollbar max-h-[215px]">
        <Table aria-label="data table" size="small">
          <TableHead>
            <TableRow>
              <TableCell
                key="serialNo"
                align="center"
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#002773',
                  fontSize: '14px',
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  padding: '8px', // Reduced padding
                }}
              >
                Sr. No.
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="center"
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#002773',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    padding: '8px', // Reduced padding
                    ...(column.id === 'actions' && { width: '60px' }), // Set width for actions column
                  }}
                  sortDirection={orderBy === column.id ? order : false}
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
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const RowComponent = 'tr'
                const rowProps = { component: 'tr' }
                return (
                  <TableRow
                    key={uuidv4()}
                    {...rowProps}
                    className="TableComponent-table-row"
                    sx={{ height: '40px' }} // Reduced row height
                  >
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        padding: '8px', // Reduced padding
                      }}
                      align="center"
                    >
                      {page * rowsPerPage + index + 1}
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        padding: '8px', // Reduced padding
                      }}
                      align="center"
                    >
                      {row.name}
                    </TableCell>
                    {columns.slice(1).map((column) => (
                      <TableCell
                        key={uuidv4()}
                        sx={{
                          textAlign: 'center',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          padding: '8px', // Reduced padding
                        }}
                        align="center"
                      >
                        <Checkbox
                          {...label}
                          checked={row.activities.some(
                            (activity) => activity.id === column.id
                          )} // Check if activity is in the list
                          size="small" // Smaller checkbox
                          onChange={() =>
                            handleCheckboxChange(row.id, column.id)
                          }
                        />
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
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{
          fontSize: '14px',
        }}
      />
    </Paper>
  )
}

export default ActivityTable
