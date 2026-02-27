import React from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Chip,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';

const SelectorPaper = styled(Paper)({
  padding: '24px',
  borderRadius: '24px',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const PatientInfo = styled(Box)({
  padding: '16px',
  borderRadius: '12px',
  background: alpha(COLORS.primary, 0.02),
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  marginTop: '16px',
});

const BRSPatientSelector = ({ 
  patients, 
  selectedPatient, 
  onSelect, 
  onAnalyze, 
  analyzing 
}) => {
  return (
    <SelectorPaper>
      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 3 }}>
        Select Patient
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Search Patient</InputLabel>
        <Select
          value={selectedPatient?.id || ''}
          onChange={(e) => {
            const patient = patients.find(p => p.id === e.target.value);
            onSelect(patient);
          }}
          label="Search Patient"
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <em>Choose a patient from vault</em>;
            }
            const patient = patients.find(p => p.id === selected);
            return `${patient?.name} (${patient?.patientId})`;
          }}
        >
          <MenuItem disabled value="">
            <em>Select a patient</em>
          </MenuItem>
          {patients.map((patient) => (
            <MenuItem key={patient.id} value={patient.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary }}>
                  {patient.name?.charAt(0) || 'P'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {patient.patientId} • {patient.age} yrs • {patient.primaryCondition}
                  </Typography>
                </Box>
                <Chip 
                  label={`${patient.claims?.length || 0} claims`}
                  size="small"
                  sx={{ bgcolor: alpha(COLORS.primary, 0.1) }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedPatient && (
        <PatientInfo>
          <Typography variant="subtitle2" sx={{ mb: 2, color: COLORS.primary }}>
            Selected Patient
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: COLORS.primary }}>
              {selectedPatient.name?.charAt(0) || 'P'}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedPatient.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                ID: {selectedPatient.patientId}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Age</Typography>
              <Typography variant="body2">{selectedPatient.age} years</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Gender</Typography>
              <Typography variant="body2">{selectedPatient.gender || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Condition</Typography>
              <Typography variant="body2">{selectedPatient.primaryCondition}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Total Claims</Typography>
              <Typography variant="body2">{selectedPatient.claims?.length || 0}</Typography>
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<PsychologyIcon />}
            onClick={onAnalyze}
            disabled={analyzing}
            sx={{
              mt: 3,
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.secondary },
              borderRadius: '40px',
              py: 1.5
            }}
          >
            {analyzing ? 'Analyzing...' : 'Calculate BRS Score'}
          </Button>
        </PatientInfo>
      )}

      {!selectedPatient && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SearchIcon sx={{ fontSize: 48, color: alpha(COLORS.primary, 0.3), mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Select a patient from the dropdown to begin analysis
          </Typography>
        </Box>
      )}
    </SelectorPaper>
  );
};

export default BRSPatientSelector;