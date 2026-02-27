import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssessmentIcon from '@mui/icons-material/Assessment';

const PatientCardStyled = styled(Card)({
  borderRadius: '16px',
  marginBottom: '12px',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 8px 24px ${alpha(COLORS.primary, 0.15)}`,
  },
});

const RiskChip = styled(Chip)(({ risk }) => ({
  background: risk === 'High' 
    ? alpha(COLORS.rejected, 0.1)
    : risk === 'Medium'
      ? alpha(COLORS.warning, 0.1)
      : alpha(COLORS.success, 0.1),
  color: risk === 'High'
    ? COLORS.rejected
    : risk === 'Medium'
      ? COLORS.warning
      : COLORS.success,
  fontWeight: 600,
}));

const PatientCard = ({ patient, onView, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleView = () => {
    handleMenuClose();
    onView(patient);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    onDelete(patient.id);
  };

  // Determine risk level based on BRS or claim history
  const getRiskLevel = () => {
    if (patient.brsScore) {
      if (patient.brsScore > 0.7) return 'Low';
      if (patient.brsScore > 0.4) return 'Medium';
      return 'High';
    }
    
    // Fallback: estimate from claims
    const claims = patient.claims || [];
    const approved = claims.filter(c => c.approved).length;
    const approvalRate = claims.length > 0 ? approved / claims.length : 1;
    
    if (approvalRate > 0.8) return 'Low';
    if (approvalRate > 0.5) return 'Medium';
    return 'High';
  };

  const riskLevel = getRiskLevel();
  const claimCount = patient.claims?.length || 0;

  return (
    <PatientCardStyled>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ bgcolor: COLORS.primary, width: 48, height: 48 }}>
              {patient.name?.charAt(0) || 'P'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {patient.name || 'Unknown Patient'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {patient.patientId} • Added: {new Date(patient.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RiskChip 
              label={`${riskLevel} Risk`} 
              risk={riskLevel}
              size="small"
            />
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: alpha(COLORS.textDark, 0.5) }} />
            <Typography variant="body2">{patient.age || '?'} years</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalHospitalIcon sx={{ fontSize: 16, color: alpha(COLORS.textDark, 0.5) }} />
            <Typography variant="body2">{patient.primaryCondition || 'No condition'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: alpha(COLORS.textDark, 0.5) }} />
            <Typography variant="body2">{claimCount} claims</Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: COLORS.rejected }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </PatientCardStyled>
  );
};

export default PatientCard;