import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  IconButton,
  Chip,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    maxWidth: '700px',
    width: '100%',
  },
});

const StepIconWrapper = styled(Box)(({ active, completed }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active 
    ? COLORS.primary 
    : completed 
      ? COLORS.success 
      : alpha(COLORS.grey, 0.1),
  color: active || completed ? 'white' : COLORS.textDark,
}));

const AddPatientForm = ({ open, onClose, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Demographics
    name: '',
    age: '',
    gender: '',
    location: '',
    incomeLevel: '',
    education: '',
    employment: '',
    
    // Medical
    primaryCondition: '',
    secondaryConditions: [],
    diagnosisYear: '',
    severity: '',
    
    // Additional
    insuranceActive: true,
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  const [tempCondition, setTempCondition] = useState('');
  const [errors, setErrors] = useState({});

  const steps = [
    { label: 'Demographics', icon: <PersonIcon /> },
    { label: 'Medical History', icon: <LocalHospitalIcon /> },
    { label: 'Review', icon: <CheckCircleIcon /> },
  ];

  const locations = [
    'urban_metro', 'urban_small', 'suburban', 'rural_town', 'rural_village'
  ];

  const incomeLevels = ['low', 'middle_low', 'middle', 'middle_high', 'high'];
  const educationLevels = ['high_school', 'bachelors', 'masters', 'phd', 'professional'];
  const employmentStatus = ['employed_full', 'employed_part', 'self_employed', 'unemployed', 'retired', 'student'];
  const genders = ['M', 'F', 'other'];
  const severities = ['mild', 'moderate', 'severe', 'critical'];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 0 || formData.age > 120) newErrors.age = 'Invalid age';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }
    
    if (step === 1) {
      if (!formData.primaryCondition) newErrors.primaryCondition = 'Primary condition is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddCondition = () => {
    if (tempCondition.trim()) {
      setFormData({
        ...formData,
        secondaryConditions: [...formData.secondaryConditions, tempCondition.trim()],
      });
      setTempCondition('');
    }
  };

  const handleRemoveCondition = (condition) => {
    setFormData({
      ...formData,
      secondaryConditions: formData.secondaryConditions.filter((c) => c !== condition),
    });
  };

  const handleSubmit = () => {
    if (validateStep(1)) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      name: '',
      age: '',
      gender: '',
      location: '',
      incomeLevel: '',
      education: '',
      employment: '',
      primaryCondition: '',
      secondaryConditions: [],
      diagnosisYear: '',
      severity: '',
      insuranceActive: true,
      enrollmentDate: new Date().toISOString().split('T')[0],
    });
    setTempCondition('');
    setErrors({});
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ 
        bgcolor: COLORS.primary, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Add New Patient</Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIconWrapper active={activeStep === index} completed={activeStep > index}>
                    {step.icon}
                  </StepIconWrapper>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Demographics */}
        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || '' })}
                error={!!errors.age}
                helperText={errors.age}
                required
                InputProps={{ inputProps: { min: 0, max: 120 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                error={!!errors.gender}
                helperText={errors.gender}
                required
              >
                {genders.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Income Level"
                value={formData.incomeLevel}
                onChange={(e) => setFormData({ ...formData, incomeLevel: e.target.value })}
              >
                {incomeLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              >
                {educationLevels.map((edu) => (
                  <MenuItem key={edu} value={edu}>{edu.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                value={formData.employment}
                onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
              >
                {employmentStatus.map((emp) => (
                  <MenuItem key={emp} value={emp}>{emp.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* Step 2: Medical History */}
        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Primary Condition"
                value={formData.primaryCondition}
                onChange={(e) => setFormData({ ...formData, primaryCondition: e.target.value })}
                error={!!errors.primaryCondition}
                helperText={errors.primaryCondition}
                required
                placeholder="e.g., Diabetes Type 2"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Diagnosis Year"
                type="number"
                value={formData.diagnosisYear}
                onChange={(e) => setFormData({ ...formData, diagnosisYear: e.target.value })}
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                {severities.map((sev) => (
                  <MenuItem key={sev} value={sev}>{sev}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Secondary Conditions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="e.g., Hypertension"
                  value={tempCondition}
                  onChange={(e) => setTempCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCondition}
                  disabled={!tempCondition.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.secondaryConditions.map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    onDelete={() => handleRemoveCondition(condition)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Step 3: Review */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Review Patient Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Name</Typography>
                <Typography variant="body2">{formData.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Age/Gender</Typography>
                <Typography variant="body2">{formData.age} years, {formData.gender}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Location</Typography>
                <Typography variant="body2">{formData.location || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Income/Education</Typography>
                <Typography variant="body2">{formData.incomeLevel || 'N/A'}, {formData.education || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Primary Condition</Typography>
                <Typography variant="body2">{formData.primaryCondition}</Typography>
              </Grid>
              {formData.secondaryConditions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Secondary Conditions</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {formData.secondaryConditions.map((cond) => (
                      <Chip key={cond} label={cond} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: COLORS.primary }}
          >
            Add Patient
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ bgcolor: COLORS.primary }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default AddPatientForm;