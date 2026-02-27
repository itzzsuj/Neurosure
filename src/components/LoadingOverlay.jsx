import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

const Overlay = styled(Paper)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: alpha(COLORS.background, 0.9),
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  borderRadius: '24px',
});

const LoadingOverlay = ({ message = 'Analyzing claim...' }) => {
  return (
    <Overlay elevation={0}>
      <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary, mb: 3 }} />
      <Typography variant="h6" sx={{ color: COLORS.textDark, fontWeight: 500 }}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.6), mt: 1 }}>
        This may take a few moments
      </Typography>
    </Overlay>
  );
};

export default LoadingOverlay;