import React from 'react';
import {
    Box,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Checkbox,
    Paper,
    Button,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Visibility, Edit, Delete } from '@mui/icons-material';

const AccessTableOutput = ({ binaryString }) => {
    const [open, setOpen] = React.useState(false);

    // Generate the checkbox state from the binary string
    const checkboxState = {
        Project: [binaryString[0] === '1', binaryString[1] === '1', binaryString[2] === '1', binaryString[3] === '1'],
        Employee: [binaryString[4] === '1', binaryString[5] === '1', binaryString[6] === '1', binaryString[7] === '1'],
        Department: [binaryString[8] === '1', binaryString[9] === '1', binaryString[10] === '1', binaryString[11] === '1']
    };

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleReset = () => {
        // Implement reset functionality if needed
    };

    return (
        <Box sx={{ maxWidth: 500, mt: '10px', mb: '25px' }}>
            <Box
                onClick={handleToggle}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
            >
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: 'Inter',
                        fontSize: '18px',
                        marginBottom: '10px',
                        color: '#7D7D7D',
                        flexGrow: 1,
                        fontWeight: 'bold',
                    }}
                >
                    Access
                </Typography>
                <IconButton size="small" sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Box>
            <Collapse in={open}>
                {/*<Box sx={{ mb: 2 }}>*/}
                {/*    <Button variant="outlined" color="primary" onClick={handleReset}>*/}
                {/*        Reset*/}
                {/*    </Button>*/}
                {/*</Box>*/}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        border: '1px solid #c4c4c4',
                        boxShadow: 'none',
                    }}
                >
                    <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Add fontSize="small" sx={{ color: '#A3A3A3', mb: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: '#585858', fontFamily: 'Inter' }}>Add</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Visibility fontSize="small" sx={{ color: '#A3A3A3', mb: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: '#585858', fontFamily: 'Inter' }}>Read</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Edit fontSize="small" sx={{ color: '#A3A3A3', mb: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: '#585858', fontFamily: 'Inter' }}>Update</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Delete fontSize="small" sx={{ color: '#A3A3A3', mb: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: '#585858', fontFamily: 'Inter' }}>Delete</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {['Project', 'Employee', 'Department'].map((row, rowIndex) => (
                                <TableRow key={row}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            borderBottom: '1px solid #e0e0e0',
                                            fontFamily: 'Inter',
                                            color: '#585858',
                                        }}
                                    >
                                        {row}
                                    </TableCell>
                                    {['Add', 'Read', 'Update', 'Delete'].map((action, index) => (
                                        <TableCell
                                            align="center"
                                            key={action}
                                            sx={{
                                                borderBottom: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <Checkbox
                                                checked={checkboxState[row][index]}
                                                disabled // Prevent user manipulation
                                                sx={{ color: '#A3A3A3' }}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};

export default AccessTableOutput;
