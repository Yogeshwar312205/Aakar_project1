import React, { useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Switch,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const AccessDisplay = ({ accessString }) => {
    const subOptions = {
        HRManagement: ['Employee Management', 'Department Management', 'Designation Management'],
        ProjectManagement: ['Project Management', 'Stage Management', 'Substage Management'],
        TrainingManagement: ['Employee Training', 'Course Management'],
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
        const groups = accessString.split(',');
        const result = {};

        Object.keys(subOptions).forEach((module, index) => {
            const group = groups[index];
            if (!group) return;

            const active = group[0] === '1'; // First bit indicates module active state

            if (!active) return;

            const isTicketModule = module === 'TicketTracking';
            const parsedSubOptions = isTicketModule
                ? subOptions[module].map((option, i) => ({
                    name: option,
                    Enable: group[i + 1] === '1', // Enable flag for each ticket option
                }))
                : subOptions[module].map((option, i) => {
                    const operationBits = group.slice(i * 4 + 1, i * 4 + 5); // Extract Add, Read, Update, Delete flags
                    return {
                        name: option,
                        Add: operationBits[0] === '1',
                        Read: operationBits[1] === '1',
                        Update: operationBits[2] === '1',
                        Delete: operationBits[3] === '1',
                    };
                });

            result[module] = { active, subOptions: parsedSubOptions };
        });

        return result;
    };

    const parsedAccess = parseAccessString(accessString);

    const [collapsedModules, setCollapsedModules] = useState(
        Object.keys(parsedAccess).reduce((acc, module) => {
            acc[module] = true;
            return acc;
        }, {})
    );

    const [moduleToggles, setModuleToggles] = useState(
        Object.keys(parsedAccess).reduce((acc, module) => {
            acc[module] = parsedAccess[module].active;
            return acc;
        }, {})
    );

    const toggleCollapse = (module) => {
        setCollapsedModules((prevState) => ({
            ...prevState,
            [module]: !prevState[module],
        }));
    };

    const handleToggleChange = (module) => {
        setModuleToggles((prevState) => ({
            ...prevState,
            [module]: !prevState[module],
        }));
    };

    return (
        <Box sx={{ maxWidth: 800, marginTop: '20px' }}>
            {Object.entries(parsedAccess).map(([module, { subOptions }]) => (
                <Box key={module} sx={{ marginBottom: '20px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                        }}
                    >
                        <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {module.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <IconButton onClick={() => handleToggleChange(module)}>
                            {collapsedModules[module] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>

                    <Collapse in={collapsedModules[module] && moduleToggles[module]}>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #c4c4c4' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Options</TableCell>
                                        {module === 'TicketTracking' ? (
                                            <TableCell align="center">Enable</TableCell>
                                        ) : (
                                            <>
                                                <TableCell align="center">Add</TableCell>
                                                <TableCell align="center">Read</TableCell>
                                                <TableCell align="center">Update</TableCell>
                                                <TableCell align="center">Delete</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subOptions.map((subOption) => (
                                        <TableRow key={subOption.name}>
                                            <TableCell>{subOption.name}</TableCell>
                                            {module === 'TicketTracking' ? (
                                                <TableCell
                                                    align="center"
                                                    sx={{ color: subOption.Enable ? 'green' : 'gray' }}
                                                >
                                                    {subOption.Enable ? '✔' : '✘'}
                                                </TableCell>
                                            ) : (
                                                ['Add', 'Read', 'Update', 'Delete'].map((action) => (
                                                    <TableCell
                                                        key={action}
                                                        align="center"
                                                        sx={{ color: subOption[action] ? 'green' : 'gray' }}
                                                    >
                                                        {subOption[action] ? '✔' : '✘'}
                                                    </TableCell>
                                                ))
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>
                </Box>
            ))}
        </Box>
    );
};

export default AccessDisplay;
