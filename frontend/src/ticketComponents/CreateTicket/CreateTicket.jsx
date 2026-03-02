import React, { useState, useEffect, useContext } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { IconButton, Button, FormControlLabel, Checkbox } from '@mui/material';
import { Save } from '@mui/icons-material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BackButton from '../Backbutton/Backbutton.jsx';
import axios from 'axios';
import UserContext from '../context/UserContext.jsx';
import Autocomplete from '@mui/material/Autocomplete';
import './CreateTicket.css';
import DeleteIcon from '@mui/icons-material/Delete';


function TicketForm() {
    const { user } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [department, setDepartment] = useState('');
    const [issueType, setIssueType] = useState('');
    const [priority, setPriority] = useState('low');
    const [status, setStatus] = useState('open');
    const [assignee, setAssignee] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [ticketTitles, setTicketTitles] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [basicSolutions, setBasicSolutions] = useState([]);
    const [solutionChecks, setSolutionChecks] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const employeeId = user?.id || 1;
    const employeeName = user?.name || '';

    const priorities = ['low', 'mid', 'high'];

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('http://localhost:3000/department/departments');
                setDepartments(response.data);
            } catch (error) {
                console.error('Error fetching departments:', error);
                alert('Error fetching departments');
            }
        };

        const fetchTicketTitles = async () => {
            try {
                const response = await axios.get('http://localhost:3000/ticketTitles/ticket_titles');
                setTicketTitles(response.data);
            } catch (error) {
                console.error('Error fetching ticket titles:', error);
                alert('Error fetching ticket titles');
            }
        };

        const fetchIssueTypes = async () => {
            try {
                const response = await axios.get('http://localhost:3000/issue_type/issue_types');
                setIssueTypes(response.data);
            } catch (error) {
                console.error('Error fetching issue types:', error);
                alert('Error fetching issue types');
            }
        };

        fetchDepartments();
        fetchTicketTitles();
        fetchIssueTypes();
    }, []);

    // Add the handleClear function
    const handleClear = () => {
        setTitle('');
        setDescription('');
        setDetails('');
        setDepartment('');
        setIssueType('');
        setPriority('low');
        setStatus('open');
        setAssignee('');
        setAttachments([]);
        setBasicSolutions([]);
        setSolutionChecks([]);
    };


    useEffect(() => {
        const updateIssueTypeAndDepartment = async () => {
            if (title && ticketTitles.map(ticket => ticket.title).includes(title)) {
                try {
                    const response = await axios.get(`http://localhost:3000/ticketTitles/ticket_titles/details_by_title/${title}`);
                    const data = response.data;
                    setIssueType(data.issue_type);
                    setDepartment(data.department);

                    const solutionsResponse = await axios.get(`http://localhost:3000/ticketTitles/ticket_titles/solutions_by_title/${title}`);
                    const solutionsData = solutionsResponse.data;

                    setBasicSolutions(solutionsData.map(solution => solution.solution));
                    setSolutionChecks(new Array(solutionsData.length).fill(false));
                } catch (error) {
                    console.error('Error fetching issue type and department for the selected title:', error);
                    alert('Error fetching issue type and department');
                }
            }
        };

        updateIssueTypeAndDepartment();
    }, [title]);

    useEffect(() => {
        setAllChecked(solutionChecks.every(check => check === true));
    }, [solutionChecks]);

    const handleSolutionCheck = (index) => {
        const updatedChecks = [...solutionChecks];
        updatedChecks[index] = !updatedChecks[index];
        setSolutionChecks(updatedChecks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!allChecked) {
            alert('Please try all basic solutions before submitting the ticket.');
            return;
        }

        if (!title || !description || !details || !department || !issueType || !priority || !status) {
            console.log(title, description, details, department, issueType, priority, status);
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('details', details);
            formData.append('department', department);
            formData.append('issue_type', issueType);
            formData.append('priority', priority);
            formData.append('status', status);
            formData.append('assignee', assignee);
            formData.append('employee_id', employeeId);
            formData.append('createdBy', employeeName);

            // Append each file in the attachments array to formData under the same field name
            attachments.forEach((file) => {
                formData.append('attachments', file); // Use 'attachments' consistently
            });

            const response = await axios.post('http://localhost:3000/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Ticket created successfully: ' + response.data.ticketId);

            // Reset form fields
            setTitle('');
            setDescription('');
            setDetails('');
            setDepartment('');
            setIssueType('');
            setPriority('low');
            setStatus('open');
            setAssignee('');
            setAttachments([]);

            setBasicSolutions([]);
            setSolutionChecks([]);
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('Error creating ticket');
        }
    };


    const handleFileChange = (e) => {
        setAttachments([...attachments, ...Array.from(e.target.files)]);
    };




    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };
    

    return (
        <div className="content-container">
            <div className="ticketContent">
                <BackButton title={"Create Ticket"} />
            </div>

            <div className="ticketContent">
                <div className="ticket-form">
                    <Box sx={{ border: '1px solid #ccc', borderRadius: 2, padding: 2, boxShadow: 1, marginBottom: 2, width: '99%', marginTop: 2, marginLeft: 1 }}>
                        <Box
                            component="form"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                alignItems: 'center',
                                width: '100%'
                            }}
                            noValidate
                            autoComplete="off"
                            onSubmit={handleSubmit}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-end',
                                    width: '100%',
                                }}
                            >
                                <div className="date">
                                    <Typography>{formattedDate}</Typography>
                                </div>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleClear}
                                >
                                    Clear All
                                </Button>


                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save />}
                                    type="submit"
                                >
                                    Save Ticket
                                </Button>


                            </Box>


                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <Autocomplete
                                    options={ticketTitles.map(ticket => ticket.title)}
                                    value={title}
                                    onChange={(event, newValue) => setTitle(newValue)}
                                    onInputChange={(event, newInputValue) => {
                                        setTitle(newInputValue); // Set the value when typing a custom input
                                    }}
                                    freeSolo
                                    renderInput={(params) => <TextField {...params} label="Ticket Title" variant="outlined" sx={{ width: '280px' }} />}
                                />

                                <TextField
                                    id="Description"
                                    label="Description"
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={{ width: '270px' }}
                                />

                                <Autocomplete
                                    options={issueTypes.map(issue => issue.issue)}
                                    value={issueType}
                                    onChange={(event, newValue) => setIssueType(newValue)}
                                    onInputChange={(event, newInputValue) => {
                                        setIssueType(newInputValue); // Set the value when typing a custom input
                                    }}
                                    freeSolo
                                    renderInput={(params) => <TextField {...params} label="Issue Type" variant="outlined" sx={{ width: '220px' }} />}
                                />

                                <Autocomplete
                                    options={departments.map(dept => dept.departmentName)}
                                    value={department}
                                    onChange={(event, newValue) => setDepartment(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Department" variant="outlined" sx={{ width: '220px' }} />}
                                />

                                <Autocomplete
                                    options={priorities}
                                    value={priority}
                                    onChange={(event, newValue) => setPriority(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Priority" variant="outlined" sx={{ width: '220px' }} />}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >

                                <TextField
                                    id="Details"
                                    label="Details"
                                    variant="outlined"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    sx={{ width: '586px' }}
                                    multiline
                                    rows={4}
                                />

                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                >
                                    Attach Files
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        hidden
                                    />
                                </Button>
                                </Box>
                                <Box>
                                {attachments.map((attachment, index) => (
                                    <Box key={index} display="flex" alignItems="center">
                                    <Typography>{attachment.name}</Typography>
                                    <IconButton onClick={() => removeAttachment(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    </Box>
                                    ))}
                                </Box>
        
    
                            

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Basic Solutions
                                </Typography>
                            </Box>
                            
                            

                            <Box>
                                


                                {basicSolutions.map((solution, index) => (
                                    <FormControlLabel
                                        key={index}
                                        control={
                                            <Checkbox
                                                checked={solutionChecks[index]}
                                                onChange={() => handleSolutionCheck(index)}
                                            />
                                        }
                                        label={solution}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </div>
            </div>
        </div>
    );
}

export default TicketForm;
