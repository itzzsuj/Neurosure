import React from 'react';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <Alert
      severity="error"
      sx={{ mb: 3, borderRadius: '12px' }}
      action={
        <IconButton color="inherit" size="small" onClick={onClose}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
    >
      {message}
    </Alert>
  );
};

export default ErrorAlert;