import React from 'react';
import { IconButton, Typography, Breadcrumbs, Link, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Icon for Back navigation
import { useNavigate } from 'react-router-dom';

const BackButton = ({ title = "Ticket details" }) => {
  const navigate = useNavigate();

  

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
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
            Dashboard / 
          </Link>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', fontSize: '1.25rem' }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default BackButton;
