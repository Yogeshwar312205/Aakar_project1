import * as React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export default function   
 CreateLog() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Button variant="outlined" startIcon={<AddIcon />} sx={{ margin: 0 }}>
        Create Log
      </Button>
    </div>
  );
}
