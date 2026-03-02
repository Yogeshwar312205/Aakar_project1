import React, { useState, useEffect } from 'react';
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
    Collapse,
    IconButton,
    Checkbox,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import downloadasexcel from '../assets/downlaodasexcel.svg';
import downloadaspdf from '../assets/downlaodaspdf.svg';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './Table/TableComponent.css';
import { FiDownload } from 'react-icons/fi';

const TableCo = ({ rows, collapseRows, columns, collapseCols, linkBasePath, defaultSortOrder, items, itemLabel, searchLabel, onFilter, enableCollapsible = false, enableCheckbox = false, enableCollapseCheckbox = false, onRowSelectionChange }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState(defaultSortOrder === 'newest' ? 'desc' : 'asc'); // Default order based on prop
    const [orderBy, setOrderBy] = useState('createdAt'); // Sort by 'createdAt' by default
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
    const [sortedRows, setSortedRows] = useState([]);
    const [openRows, setOpenRows] = useState({});
    const [checkedRows, setCheckedRows] = useState([]);
    const [checkedCollapseRows, setCheckedCollapseRows] = useState({});
    
    // Sync sortedRows with rows whenever rows prop changes, and apply default sorting
    const sortRows = (order) => {
        const sorted = [...rows].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setSortedRows(sorted);
      };

    // useEffect to call sortRows only when defaultSortOrder changes
    useEffect(() => {
        if (defaultSortOrder) {
          // If defaultSortOrder is provided, sort rows accordingly
          sortRows(defaultSortOrder);
        } else {
          // Otherwise, directly set rows without sorting
          setSortedRows(rows);
        }
      }, [defaultSortOrder, rows]);

    const handleToggleRow = (rowIndex) => {
        setOpenRows((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrder(newOrder);
        setOrderBy(property);
    
        // Apply sorting to rows (based on whether sortedRows exists)
        const dataToSort = sortedRows || rows;
        const sorted = [...dataToSort].sort(getComparator(newOrder, property));
        setSortedRows(sorted);
    };

    const descendingComparator = (a, b, property) => {
        if (!a[property]) return 1;
        if (!b[property]) return -1;
        if (a[property] < b[property]) return -1;
        if (a[property] > b[property]) return 1;
        return 0;
    };

    const getComparator = (order, property) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(b, a, property)
            : (a, b) => descendingComparator(a, b, property);
    };

    const handleDownloadClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSortByCreatedAt = (order) => {
        const sorted = [...rows].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return order === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setSortedRows(sorted);
        setSortMenuAnchorEl(null);
    };

    const exportToExcel = (rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'data.xlsx');
    };

    const exportToPDF = (rows) => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [columns.map((col) => col.label)],
            body: rows.map((row) => columns.map((col) => row[col.id])),
        });
        doc.save('data.pdf');
    };

    const data = sortedRows || rows;
    
    const downloadFile = (type) => {
        type === 'excel' ? exportToExcel(sortedRows) : exportToPDF(sortedRows);
        handleClose();
    };


    const handleCheckboxChange = (index, row) => {
        setCheckedRows((prev) => {
            const updated = [...prev];
            
            // Select or deselect the row
            if (updated[index]) {
                delete updated[index]; // Deselect the row
            } else {
                updated[index] = row; // Select the row
            }
    
            // Pass updated selection to parent (only selected rows as an array)
            const selectedRows = Object.values(updated).filter(Boolean); // Remove undefined values
            onRowSelectionChange(selectedRows); // Send only selected rows as an array
    
            return updated;
        });
    };
    

    // Updated function to handle checkbox selection for collapsible rows
    const handleCollapseCheckboxChange = (parentIndex, index, row) => {
        setCheckedCollapseRows((prev) => {
            const updated = { ...prev };
    
            // Ensure the parent index exists and is an object
            if (!updated[parentIndex]) {
                updated[parentIndex] = {};
            }
    
            // Toggle selection for the specific row
            if (updated[parentIndex][index]) {
                delete updated[parentIndex][index]; // Deselect the row
            } else {
                updated[parentIndex][index] = row; // Select the row
            }
    
            // Remove parent index if no rows are selected under it
            if (Object.keys(updated[parentIndex]).length === 0) {
                delete updated[parentIndex];
            }
    
            // Pass the updated selection to the parent component
            // Use Object.values(updated) to get all selected rows and flatten them into an array
            const selectedRows = Object.values(updated)
                .flatMap((parentRows) => Object.values(parentRows)); // Flatten selected rows
    
            // Send the selected rows as an array to the parent component
            onRowSelectionChange({
                collapse: selectedRows,
            });
    
            return updated;
        });
    };
    

    // Function to check if all rows (including collapsible) are selected
    const computeSelectionState = () => {
        const totalMainRows = sortedRows.length;
    
        const selectedMainRows = Object.keys(checkedRows).length;
    
        return {
            isAllSelected: selectedMainRows === totalMainRows && totalMainRows > 0,
            isIndeterminate: selectedMainRows > 0 && selectedMainRows < totalMainRows,
        };
    };
    
    const { isAllSelected, isIndeterminate } = computeSelectionState();
   
    const handleSelectAll = () => {
        if (isAllSelected) {
            // Deselect all rows
            setCheckedRows({});
            onRowSelectionChange([]); // Pass an empty array since no rows are selected
        } else {
            // Select all rows
            const allCheckedRows = {};
    
            sortedRows.forEach((row, index) => {
                allCheckedRows[index] = row;
            });
    
            setCheckedRows(allCheckedRows);
    
            // Pass selected rows as an array to the parent
            const selectedRows = Object.values(allCheckedRows);
            onRowSelectionChange(selectedRows);
        }
    };
    
    
    const handleCollapseRowSelectAll = (rowIndex, checked) => {
        setCheckedCollapseRows((prev) => {
            const updated = { ...prev };
            if (!updated[rowIndex]) {
                updated[rowIndex] = {};
            }
    
            collapseRows[rowIndex]?.forEach((_, collapseIndex) => {
                updated[rowIndex][collapseIndex] = checked ? collapseRows[rowIndex][collapseIndex] : undefined;
            });
    
            if (!checked) {
                delete updated[rowIndex];
            }
            return updated;
        });
    };    
    
    const isCollapseRowAllSelected = (rowIndex) => {
        const collapsibleRows = collapseRows[rowIndex] || [];
        const selectedCollapseRows = Object.values(checkedCollapseRows[rowIndex] || {}).filter(Boolean).length;
        return selectedCollapseRows === collapsibleRows.length && collapsibleRows.length > 0;
    };    
    
    const isCollapseRowIndeterminate = (rowIndex) => {
        const collapsibleRows = collapseRows[rowIndex] || [];
        const selectedCollapseRows = Object.values(checkedCollapseRows[rowIndex] || {}).filter(Boolean).length;
        return selectedCollapseRows > 0 && selectedCollapseRows < collapsibleRows.length;
    };
    
    return (
        <Box>
            <div
                className="flex items-center justify-between"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                {/* <Searchbar
                    items={items}
                    itemLabel={itemLabel}
                    searchLabel={searchLabel}
                    onFilter={onFilter}
                /> */}

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
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
                                {enableCheckbox && (
                                    <TableCell>
                                        <Checkbox
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                )}
                                <TableCell
                                    style={{ color: '#0061A1', fontWeight: 'bold', textAlign: 'center' }}
                                    align="center"
                                >
                                    Sr. No.
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        sortDirection={orderBy === column.id ? order : false}
                                        style={{
                                            color: '#0061A1', 
                                            fontWeight: 'bold', 
                                            align: column.align || 'center',
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
                                    const RowComponent = linkBasePath ? Link : 'tr';
                                    const rowProps = linkBasePath
                                        ? {
                                            component: RowComponent,
                                            to: `${linkBasePath}/${row.empId || row.deptId || row.projectId}`,
                                            sx: {
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                            },
                                        }
                                        : { component: 'tr' };
                                    
                                    // Check if collapseRows has data for the current row
                                    const hasCollapseData = Array.isArray(collapseRows) && collapseRows[index] && collapseRows[index].length > 0;

                                    return (
                                        <React.Fragment key={uuidv4()}>
                                            <TableRow {...rowProps}>
                                                {enableCollapsible && (
                                                    <TableCell style={{ width: 48 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {enableCheckbox && (
                                                                <Checkbox
                                                                    checked={!!checkedRows[index]}
                                                                    onChange={() => handleCheckboxChange(index, row)}
                                                                />
                                                            )}
                                                            {hasCollapseData && (
                                                                <IconButton
                                                                    onClick={() => handleToggleRow(index)}
                                                                    size="small"
                                                                    style={{padding: 1, borderRadius: '50px', transition: 'all 0.2s', width: '20px',}}
                                                                >
                                                                    {openRows[index] ? (
                                                                        <KeyboardArrowUpIcon fontSize="small" />
                                                                    ) : (
                                                                        <KeyboardArrowDownIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}

                                                {!enableCollapsible && enableCheckbox && (
                                                    <TableCell style={{width: 48}}>
                                                        <Checkbox
                                                            checked={!!checkedRows[index]}
                                                            onChange={() => handleCheckboxChange(index, row)}
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell align="center">
                                                    {page * rowsPerPage + index + 1}
                                                </TableCell>
                                                {columns.map((column) => (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.render ? column.render(row) : row[column.id]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>

                                            {enableCollapsible && openRows[index] && hasCollapseData && (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length + 1}>
                                                        <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                                                            <Box>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            {enableCollapseCheckbox && (
                                                                                <TableCell>
                                                                                    <Checkbox
                                                                                        checked={isCollapseRowAllSelected(index)}
                                                                                        indeterminate={isCollapseRowIndeterminate(index)}
                                                                                        onChange={(event) => handleCollapseRowSelectAll(index, event.target.checked)}
                                                                                    />
                                                                                </TableCell>
                                                                            )}
                                                                            {collapseCols.map((col) => (
                                                                                <TableCell key={col.id} align="center" style={{color: '#0061A1', fontWeight: 'bold',}}>
                                                                                    {col.label}
                                                                                </TableCell>
                                                                            ))}
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {collapseRows[index].map((detail, idx) => (
                                                                            <TableRow key={uuidv4()}>
                                                                                {enableCollapseCheckbox && (
                                                                                    <Checkbox
                                                                                        checked={!!checkedCollapseRows[index]?.[idx]}
                                                                                        onChange={() => handleCollapseCheckboxChange(index, idx, detail)}
                                                                                    />
                                                                                )}
                                                                                {collapseCols.map((col) => (
                                                                                    <TableCell key={col.id}>
                                                                                        {detail[col.id]}
                                                                                    </TableCell>
                                                                                ))}
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                        </React.Fragment>
                                    );
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
    );
};

export default TableCo;