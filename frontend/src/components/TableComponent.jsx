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
import { Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './TableComponent.css'

const TableComponent = ({
  rows,
  columns,
  linkBasePath,
  onRowClick,
  rowClassName,
}) => {
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

  return (
    <Paper className="TableComponent-table-container">
      <TableContainer className="TableComponent-custom-scrollbar">
        <Table aria-label="data table">
          <TableHead>
            <TableRow>
              <TableCell
                key="serialNo"
                align="center"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#FFFFFF',
                  color: '#002773',
                  fontSize: '16px',
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                Sr. No.
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#FFFFFF',
                    color: '#002773',
                    fontSize: '16px',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
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
                const RowComponent = linkBasePath ? Link : 'tr'
                const rowProps = linkBasePath
                  ? {
                      component: RowComponent,
                      to: `${linkBasePath}/${row.empId || row.departmentId}`,
                      sx: { cursor: 'pointer', textDecoration: 'none' },
                    }
                  : { component: 'tr' }

                return (
                  <TableRow
                    key={uuidv4()}
                    {...rowProps}
                    className="TableComponent-table-row"
                  >
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      align="center"
                    >
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={uuidv4()}
                        sx={{
                          textAlign: 'center',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        align={column.align}
                      >
                        {column.render ? column.render(row) : row[column.id]}
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
      />
    </Paper>
  )
}

export default TableComponent
