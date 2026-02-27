import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

const SpinnerContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  width: '100%',
});

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <SpinnerContainer>
      <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center' }}>
        <CircularProgress size={48} thickness={4} sx={{ color: COLORS.primary, mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      </Paper>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;