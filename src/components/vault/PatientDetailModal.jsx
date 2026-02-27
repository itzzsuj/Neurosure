import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
  Paper,
  Button,
  Divider,
  Tab,
  Tabs,
  Avatar,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';
import ClaimHistoryTable from './ClaimHistoryTable';
import AddClaimForm from './AddClaimForm';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    maxWidth: '900px',
    width: '100%',
  },
});

const DetailSection = styled(Paper)({
  padding: '16px',
  borderRadius: '12px',
  background: alpha(COLORS.primary, 0.02),
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  height: '100%',
});

const InfoRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const PatientDetailModal = ({ open, onClose, patient, onAddClaim }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddClaim, setShowAddClaim] = useState(false);

  if (!patient) return null;

  const handleAddClaim = (claimData) => {
    onAddClaim(patient.id, claimData);
    setShowAddClaim(false);
  };

  const getRiskColor = () => {
    if (patient.brsScore) {
      if (patient.brsScore > 0.7) return COLORS.success;
      if (patient.brsScore > 0.4) return COLORS.warning;
      return COLORS.rejected;
    }
    return COLORS.grey;
  };

  const getRiskLabel = () => {
    if (patient.brsScore) {
      if (patient.brsScore > 0.7) return 'Low Risk';
      if (patient.brsScore > 0.4) return 'Medium Risk';
      return 'High Risk';
    }
    return 'Not Calculated';
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: COLORS.primary, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'white', color: COLORS.primary }}>
            {patient.name?.charAt(0) || 'P'}
          </Avatar>
          <Box>
            <Typography variant="h6">{patient.name || 'Unknown Patient'}</Typography>
            <Typography variant="caption">ID: {patient.patientId}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <DetailSection>
              <Typography variant="caption" color="textSecondary">Age</Typography>
              <Typography variant="h6">{patient.age || 'N/A'} years</Typography>
            </DetailSection>
          </Grid>
          <Grid item xs={6} md={3}>
            <DetailSection>
              <Typography variant="caption" color="textSecondary">Gender</Typography>
              <Typography variant="h6">{patient.gender || 'N/A'}</Typography>
            </DetailSection>
          </Grid>
          <Grid item xs={6} md={3}>
            <DetailSection>
              <Typography variant="caption" color="textSecondary">Total Claims</Typography>
              <Typography variant="h6">{patient.claims?.length || 0}</Typography>
            </DetailSection>
          </Grid>
          <Grid item xs={6} md={3}>
            <DetailSection>
              <Typography variant="caption" color="textSecondary">Risk Level</Typography>
              <Chip 
                label={getRiskLabel()}
                size="small"
                sx={{ 
                  bgcolor: alpha(getRiskColor(), 0.1),
                  color: getRiskColor(),
                  fontWeight: 600,
                  mt: 0.5
                }}
              />
            </DetailSection>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Left Column - Demographics */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Demographics & Medical History
            </Typography>
            
            <DetailSection sx={{ p: 2, mb: 2 }}>
              <InfoRow>
                <PersonIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Age & Gender</Typography>
                  <Typography variant="body2">{patient.age} years, {patient.gender || 'Not specified'}</Typography>
                </Box>
              </InfoRow>
              
              <InfoRow>
                <LocationOnIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Location</Typography>
                  <Typography variant="body2">{patient.location || 'Not specified'}</Typography>
                </Box>
              </InfoRow>
              
              <InfoRow>
                <AttachMoneyIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Income Level</Typography>
                  <Typography variant="body2">{patient.incomeLevel || 'Not specified'}</Typography>
                </Box>
              </InfoRow>
              
              <InfoRow>
                <SchoolIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Education</Typography>
                  <Typography variant="body2">{patient.education || 'Not specified'}</Typography>
                </Box>
              </InfoRow>
              
              <InfoRow>
                <WorkIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Employment</Typography>
                  <Typography variant="body2">{patient.employment || 'Not specified'}</Typography>
                </Box>
              </InfoRow>
            </DetailSection>

            <DetailSection sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Medical Conditions</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Primary</Typography>
                <Chip 
                  label={patient.primaryCondition || 'None'}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: alpha(COLORS.primary, 0.1) }}
                />
              </Box>
              
              {patient.secondaryConditions?.length > 0 && (
                <Box>
                  <Typography variant="caption" color="textSecondary">Secondary</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {patient.secondaryConditions.map((cond, idx) => (
                      <Chip key={idx} label={cond} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </DetailSection>
          </Grid>

          {/* Right Column - Claims History */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Claim History
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setShowAddClaim(true)}
                sx={{ borderRadius: '20px' }}
              >
                Add Claim
              </Button>
            </Box>

            {showAddClaim ? (
              <AddClaimForm 
                onSubmit={handleAddClaim}
                onCancel={() => setShowAddClaim(false)}
              />
            ) : (
              <ClaimHistoryTable claims={patient.claims || []} />
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '20px' }}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PatientDetailModal;