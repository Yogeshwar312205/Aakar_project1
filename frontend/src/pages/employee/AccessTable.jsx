import React, { useState, useEffect } from 'react';
import {
    Box,
    Checkbox,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

const AccessTable = ({ access, setAccess }) => {
    const initialState = {
        HRManagement: { active: false, subOptions: [] },
        ProjectManagement: { active: false, subOptions: [] },
        TrainingManagement: { active: false, subOptions: [] },
        TicketTracking: { active: false, subOptions: [] },
    };

    const subOptions = {
        HRManagement: ['Employee Management', 'Department Management', 'Designation Management'],
        ProjectManagement: ['Project Management', 'Stage Management', 'Substage Management'],
        TrainingManagement: ['Employee Status', 'Skills', 'Skill Matrix', 'Assign Training', 'Training Plan', 'Training Status'],
        TicketTracking: [
            'View self created tickets',
            'View department created tickets',
            'View department assigned tickets',
            'View all tickets',
            'Change ticket status',
            'Change ticket assignee',
            'Get and release ticket',
            'Reopen ticket',
        ],
    };

    const parseAccessString = (accessString) => {
        if (!accessString) return initialState;

        const modules = accessString.split(',');
        const parsedState = { ...initialState };

        Object.keys(parsedState).forEach((module, moduleIndex) => {
            const moduleAccess = modules[moduleIndex] || '';
            const active = moduleAccess[0] === '1';
            const subOptionsBits = moduleAccess.slice(1);

            parsedState[module].active = active;

            if (active) {
                const subOptionsArray = [];
                if (module === 'TicketTracking') {
                    // Single checkbox logic for Ticket Tracking
                    for (let i = 0; i < subOptions[module].length; i++) {
                        subOptionsArray.push({ All: subOptionsBits[i] === '1' });
                    }
                } else {
                    // HR Management and others with Add, Read, Update, Delete
                    for (let i = 0; i < subOptions[module].length; i++) {
                        const startIndex = i * 4;
                        const subOptionBits = subOptionsBits.slice(startIndex, startIndex + 4);
                        subOptionsArray.push({
                            Add: subOptionBits[0] === '1',
                            Read: subOptionBits[1] === '1',
                            Update: subOptionBits[2] === '1',
                            Delete: subOptionBits[3] === '1',
                        });
                    }
                }
                parsedState[module].subOptions = subOptionsArray;
            }
        });

        return parsedState;
    };

    const [moduleState, setModuleState] = useState(parseAccessString(access));

    useEffect(() => {
        setModuleState(parseAccessString(access));
    }, [access]);

    const handleToggleModule = (module) => {
        setModuleState((prevState) => ({
            ...prevState,
            [module]: {
                ...prevState[module],
                active: !prevState[module].active,
                subOptions: !prevState[module].active
                    ? Array(subOptions[module].length).fill(
                        module === 'TicketTracking'
                            ? { All: false }
                            : { Add: false, Read: false, Update: false, Delete: false }
                    )
                    : [],
            },
        }));
    };

    const handleCheckboxChange = (module, subOptionIndex, action) => {
        setModuleState((prevState) => {
            const updatedSubOptions = [...prevState[module].subOptions];
            if (module === 'TicketTracking') {
                updatedSubOptions[subOptionIndex] = {
                    All: !updatedSubOptions[subOptionIndex].All,
                };
            } else {
                updatedSubOptions[subOptionIndex] = {
                    ...updatedSubOptions[subOptionIndex],
                    [action]: !updatedSubOptions[subOptionIndex][action],
                };
            }

            return {
                ...prevState,
                [module]: {
                    ...prevState[module],
                    subOptions: updatedSubOptions,
                },
            };
        });
    };

    useEffect(() => {
        const generateAccessString = () => {
            const groups = Object.keys(moduleState).map((module) => {
                const { active, subOptions } = moduleState[module];
                if (!active) return '0'.repeat(52);

                const bits = ['1'];
                if (module === 'TicketTracking') {
                    subOptions.forEach((subOption) => {
                        bits.push(subOption.All ? '1' : '0');
                    });
                } else {
                    subOptions.forEach((subOption) => {
                        ['Add', 'Read', 'Update', 'Delete'].forEach((action) => {
                            bits.push(subOption[action] ? '1' : '0');
                        });
                    });
                }
                return bits.join('').padEnd(52, '0');
            });

            return groups.join(',');
        };

        const newAccessString = generateAccessString();
        setAccess(newAccessString); // Update the access string in parent state
        console.log('Updated Access String:', newAccessString); // Log the access string
    }, [moduleState, setAccess]);

    return (
        <div className="add-employee-details my-1 bg-white rounded">
            <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#7D7D7D', fontWeight: 'bold' }}>Manage Access</h3>
            <Box sx={{ maxWidth: 700, marginLeft: '10px', marginTop: '20px' }}>
                {Object.keys(subOptions).map((module) => (
                    <Box key={module} sx={{ marginBottom: '20px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'semibold',
                                    flexGrow: 1,
                                    fontSize: '17px',
                                    marginBottom: '10px',
                                    color: '#000',
                                }}
                            >
                                {module.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Switch
                                checked={moduleState[module].active}
                                onChange={() => handleToggleModule(module)}
                                color="primary"
                                inputProps={{ 'aria-label': `${module} toggle` }}
                            />
                        </Box>

                        {moduleState[module].active && (
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
                                            <TableCell>Options</TableCell>
                                            {module === 'TicketTracking' ? (
                                                <TableCell align="center">Enable</TableCell>
                                            ) : (
                                                ['Add', 'Read', 'Update', 'Delete'].map((action) => (
                                                    <TableCell key={action} align="center">{action}</TableCell>
                                                ))
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {subOptions[module].map((subOption, index) => (
                                            <TableRow key={subOption}>
                                                <TableCell component="th" scope="row">
                                                    {subOption}
                                                </TableCell>
                                                {module === 'TicketTracking' ? (
                                                    <TableCell align="center">
                                                        <Checkbox
                                                            checked={
                                                                moduleState[module].subOptions[index]?.All || false
                                                            }
                                                            onChange={() =>
                                                                handleCheckboxChange(module, index, 'All')
                                                            }
                                                        />
                                                    </TableCell>
                                                ) : (
                                                    ['Add', 'Read', 'Update', 'Delete'].map((action) => (
                                                        <TableCell key={action} align="center">
                                                            <Checkbox
                                                                checked={
                                                                    moduleState[module].subOptions[index]?.[action] || false
                                                                }
                                                                onChange={() =>
                                                                    handleCheckboxChange(module, index, action)
                                                                }
                                                            />
                                                        </TableCell>
                                                    ))
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                ))}
            </Box>
        </div>
    );
};

export default AccessTable;
