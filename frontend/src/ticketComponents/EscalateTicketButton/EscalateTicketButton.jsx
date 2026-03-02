import React from 'react';
import Button from '@mui/material/Button';

const EscalateTicketButton = () => {
  const handleEscalate = () => {
    // Handle escalation logic here
    console.log('Escalating ticket...');
  };

  return (
    <Button variant="contained" color="error" onClick={handleEscalate}>
      Escalate Ticket
    </Button>
  );
};

export default EscalateTicketButton;