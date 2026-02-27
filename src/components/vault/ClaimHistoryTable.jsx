import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmergencyIcon from '@mui/icons-material/Emergency';
import HealingIcon from '@mui/icons-material/Healing';

const StyledTableContainer = styled(TableContainer)({
  borderRadius: '12px',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const ClaimHistoryTable = ({ claims }) => {
  if (!claims || claims.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
        <Typography variant="body2" color="textSecondary">
          No claim history available
        </Typography>
      </Paper>
    );
  }

  const getClaimTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'emergency':
        return <EmergencyIcon sx={{ color: COLORS.warning, fontSize: 18 }} />;
      case 'hospitalization':
        return <LocalHospitalIcon sx={{ color: COLORS.info, fontSize: 18 }} />;
      default:
        return <HealingIcon sx={{ color: COLORS.success, fontSize: 18 }} />;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <StyledTableContainer>
      <Table size="small">
        <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.05) }}>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Diagnosis</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {claims.map((claim, index) => (
            <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha(COLORS.primary, 0.02) } }}>
              <TableCell>
                <Typography variant="body2">
                  {new Date(claim.date).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {getClaimTypeIcon(claim.claimType || claim.type)}
                  <Typography variant="body2">
                    {claim.claimType || claim.type || 'Routine'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {claim.diagnosis || 'Not specified'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatAmount(claim.amount)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {claim.approved ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Approved"
                    size="small"
                    sx={{
                      bgcolor: alpha(COLORS.success, 0.1),
                      color: COLORS.success,
                    }}
                  />
                ) : (
                  <Chip
                    icon={<CancelIcon />}
                    label="Rejected"
                    size="small"
                    sx={{
                      bgcolor: alpha(COLORS.rejected, 0.1),
                      color: COLORS.rejected,
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default ClaimHistoryTable;