import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Link } from '@mui/material';
import { IoMail } from 'react-icons/io5'; // Icon for Manage Send Mail To
import { GoIssueDraft, GoIssueClosed } from 'react-icons/go'; // Icons for Manage Issue Types
import { MdOutlineQuestionAnswer } from 'react-icons/md'; // Icon for Manage Basic Solutions
import { IoTicketSharp } from 'react-icons/io5'; // Icon for Manage Ticket Titles
import { FaFemale, FaMale } from 'react-icons/fa'; // Icons for Manage Employees
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Icon for Back navigation
import { useNavigate } from 'react-router-dom';

const AdminFunctionalities = () => {
  const navigate = useNavigate();

  // Action handlers
  const handleSendMailTo = () => {
    // Logic to send an email or open a form for configuring email recipients
    navigate('/send-mail-to');
  };

  const handleIssueTypes = () => {
    // Navigate to the Issue Types management page or perform any other action
    navigate('/issue-types');
  };

  const handleBasicSolutions = () => {
    // Navigate to Basic Solutions page or open a modal for adding solutions
    navigate('/basic-solutions');
  };

  const handleTicketTitles = () => {
    // Navigate to Ticket Titles management page
    navigate('/ticket-titles');
  };

  const handleEmployees = () => {
    // Navigate to Employees management page or open employee form
    navigate('/employee-form');
  };

  

  return (
    <Box p={{ xs: '8px', sm: '16px' }} sx={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header with Back Button and Breadcrumb */}
      <Box display="flex" alignItems="center" mb={2}>
        <IoArrowBackCircleOutline
          style={{ fontSize: '2rem', color: '#0061A1', cursor: 'pointer' }}
          onClick={() => navigate(-1)} // Navigate back to previous page
        />
        <Box display="flex" alignItems="center" ml={2}>
          <Link
            component="button"
            onClick={() => navigate('/dashboard')}
            sx={{ color: '#A3A3A3', fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', mr: 1 }}
          >
            Dashboard
          </Link>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', fontSize: '1.25rem' }}>
            / Admin Functionalities
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={2}>
        {/* Manage Issue Types Card */}
        <Grid item xs={12} sm={6} md={4}>
        <Card
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
      }}
      onClick={handleIssueTypes}
    >
      <CardContent>
        {/* Icons Container */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'FlexStart',
            alignItems: 'center',
            gap: 2, // Spacing between icons
            mb: 2,
            
          }}
        >
          <GoIssueDraft style={{ fontSize: '3rem', color: '#0061A1' }} />
          <GoIssueClosed style={{ fontSize: '3rem', color: '#0061A1' }} />
        </Box>
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
          Manage Issue Types
        </Typography>
        {/* Description */}
        <Typography variant="body2" sx={{ color: '#777', mt: 1 }}>
          Define and manage different types of issues for your system.
        </Typography>
      </CardContent>
    </Card>
        </Grid>

        {/* Manage Basic Solutions Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer', // Add cursor pointer for interactivity
              
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: 6,
        },
            }}
            onClick={handleBasicSolutions} // Trigger action on card click
          >
            <CardContent>
              <MdOutlineQuestionAnswer style={{ fontSize: '3rem', color: '#0061A1' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                Manage Basic Solutions
              </Typography>
              <Typography variant="body2" sx={{ color: '#777', mt: 1 }}>
                Manage predefined solutions for common issues.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Manage Ticket Titles Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer', // Add cursor pointer for interactivity
              
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
            }}
            onClick={handleTicketTitles} // Trigger action on card click
          >
            <CardContent>
              <IoTicketSharp style={{ fontSize: '3rem', color: '#0061A1' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                Manage Ticket Titles
              </Typography>
              <Typography variant="body2" sx={{ color: '#777', mt: 1 }}>
                Manage and configure ticket titles for your system.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        

        {/* Manage Send Mail To Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer', // Add cursor pointer for interactivity
              
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
            }}
            onClick={handleSendMailTo} // Trigger action on card click
          >
            <CardContent>
              <IoMail style={{ fontSize: '3rem', color: '#0061A1' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                Manage Send Mail To
              </Typography>
              <Typography variant="body2" sx={{ color: '#777', mt: 1 }}>
                Configure who will receive the mail in different events.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminFunctionalities;