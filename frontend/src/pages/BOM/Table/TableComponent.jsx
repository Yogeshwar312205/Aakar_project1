import React, { useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, TableSortLabel, IconButton
} from '@mui/material'
import { Link } from 'react-router-dom'
import { MdModeEditOutline, MdDelete } from 'react-icons/md'
import './TableComponent.css'

const TableComponent = ({ rows, columns, linkBasePath, setTriggerEdit, handleDeleteButton, view }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('')

  const handleEditButton = (bomId) => {
    if (setTriggerEdit) setTriggerEdit((pre) => ({ ...pre, active: true, id: bomId }))
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const descendingComparator = (a, b, orderBy) => {
    if ((b[orderBy] || '') < (a[orderBy] || '')) return -1
    if ((b[orderBy] || '') > (a[orderBy] || '')) return 1
    return 0
  }

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  const stableSort = (array, comparator) => {
    const stabilized = array.map((el, i) => [el, i])
    stabilized.sort((a, b) => {
      const o = comparator(a[0], b[0])
      if (o !== 0) return o
      return a[1] - b[1]
    })
    return stabilized.map((el) => el[0])
  }

  const sorted = stableSort(rows, getComparator(order, orderBy))
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const cellSx = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    padding: '12px 12px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e6edf5',
    color: '#1a2b3b',
  }
  const headSx = {
    fontWeight: 700,
    backgroundColor: '#eef5fc',
    color: '#0e4d79',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    padding: '12px 12px',
    fontFamily: 'Inter, sans-serif',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #cfdeec',
  }

  return (
    <Paper sx={{ borderRadius: '14px', boxShadow: '0 8px 20px rgba(14,77,121,0.08)', overflow: 'hidden', border: '1px solid #d8e4ef' }}>
      <TableContainer className="custom-scrollbar" sx={{ maxHeight: 480 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Sr.</TableCell>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align} sx={headSx} sortDirection={orderBy === col.id ? order : false}>
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleRequestSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              {setTriggerEdit && <TableCell sx={headSx} align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row, index) => {
              const RowComp = linkBasePath ? Link : 'tr'
              const rowProps = linkBasePath
                ? { component: RowComp, to: `${linkBasePath}/${row.projectNumber || row.deptId}`, sx: { cursor: 'pointer', textDecoration: 'none' } }
                : { component: 'tr' }

              return (
                <TableRow
                  key={row.bomId || row.projectNumber || index}
                  {...rowProps}
                  hover
                  sx={{
                    ...(rowProps.sx || {}),
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9fbfd',
                    '&:hover': { backgroundColor: '#edf4fb' },
                  }}
                >
                  <TableCell sx={cellSx}>{page * rowsPerPage + index + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align} sx={cellSx}>
                      {row[col.id] != null ? row[col.id] : '-'}
                    </TableCell>
                  ))}
                  {setTriggerEdit && (
                    <TableCell sx={cellSx} align="center">
                      <IconButton size="medium" onClick={() => handleEditButton(row.bomId)} sx={{ color: '#0061A1' }}>
                        <MdModeEditOutline size={20} />
                      </IconButton>
                      {view === "designer" && handleDeleteButton && (
                        <IconButton size="medium" onClick={() => handleDeleteButton(row.itemId)} sx={{ color: '#d32f2f' }}>
                          <MdDelete size={20} />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
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
        onPageChange={(e, n) => setPage(n)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{
          borderTop: '1px solid #dce6f0',
          backgroundColor: '#f8fbff',
          '& .MuiTablePagination-toolbar': { minHeight: '48px' },
        }}
      />
    </Paper>
  )
}

export default TableComponent
