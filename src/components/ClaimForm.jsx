import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  OutlinedInput,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import COLORS from '../styles/colors';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import HealingIcon from '@mui/icons-material/Healing';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const FormSection = styled(Paper)({
  padding: '32px',
  borderRadius: '24px',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 24px ${alpha(COLORS.primary, 0.1)}`,
  },
});

const StepIconWrapper = styled(Box)(({ active, completed }) => ({
  width: 40,
  height: 40,
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
  transition: 'all 0.3s ease',
}));

const ClaimForm = ({ diseases, onSubmit, isAnalyzing, uploadedFile, uploadStatus }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    pre_existing_conditions: [],
    enrollment_date: null,
    application_date: null,
    disease: '',
  });
  
  const [errors, setErrors] = useState({});
  const [tempCondition, setTempCondition] = useState('');

  const steps = [
    {
      label: 'Personal Information',
      description: 'Age and insurance dates',
      icon: <PersonIcon />,
    },
    {
      label: 'Medical History',
      description: 'Pre-existing conditions',
      icon: <HistoryIcon />,
    },
    {
      label: 'Claim Details',
      description: 'Disease being claimed',
      icon: <HealingIcon />,
    },
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.age) newErrors.age = 'Age is required';
      else if (formData.age < 0 || formData.age > 120) newErrors.age = 'Invalid age (0-120)';
      
      if (!formData.enrollment_date) newErrors.enrollment_date = 'Enrollment date required';
      if (!formData.application_date) newErrors.application_date = 'Application date required';
      
      if (formData.enrollment_date && formData.application_date) {
        if (formData.application_date < formData.enrollment_date) {
          newErrors.application_date = 'Application date cannot be before enrollment';
        }
      }
    }
    
    if (step === 2) {
      if (!formData.disease) newErrors.disease = 'Please select a disease/condition';
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
        pre_existing_conditions: [...formData.pre_existing_conditions, tempCondition.trim()],
      });
      setTempCondition('');
    }
  };

  const handleRemoveCondition = (condition) => {
    setFormData({
      ...formData,
      pre_existing_conditions: formData.pre_existing_conditions.filter((c) => c !== condition),
    });
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      onSubmit(formData);
    }
  };

  const calculateDaysDifference = () => {
    if (formData.enrollment_date && formData.application_date) {
      const days = Math.ceil(
        (formData.application_date - formData.enrollment_date) / (1000 * 60 * 60 * 24)
      );
      return days;
    }
    return null;
  };

  const daysDiff = calculateDaysDifference();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormSection>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: COLORS.primary }}>
          Patient Details
        </Typography>

        {/* Upload Status */}
        {!uploadedFile && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
            Please upload a policy document above first
          </Alert>
        )}
        {uploadedFile && uploadStatus === 'completed' && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} icon={<CheckCircleIcon />}>
            Policy ready for evaluation
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIconWrapper active={activeStep === index} completed={activeStep > index}>
                    {step.icon}
                  </StepIconWrapper>
                )}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {/* Step 0: Personal Information */}
                {index === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || '' })}
                        error={!!errors.age}
                        helperText={errors.age}
                        InputProps={{ inputProps: { min: 0, max: 120 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Enrollment Date"
                        value={formData.enrollment_date}
                        onChange={(date) => setFormData({ ...formData, enrollment_date: date })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.enrollment_date}
                            helperText={errors.enrollment_date}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Application Date"
                        value={formData.application_date}
                        onChange={(date) => setFormData({ ...formData, application_date: date })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.application_date}
                            helperText={errors.application_date}
                          />
                        )}
                      />
                    </Grid>
                    {daysDiff !== null && daysDiff >= 0 && (
                      <Grid item xs={12}>
                        <Alert 
                          icon={<CalendarTodayIcon />}
                          severity="info"
                          sx={{ borderRadius: '12px' }}
                        >
                          <strong>{daysDiff} days</strong> since enrollment
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                )}

                {/* Step 1: Medical History */}
                {index === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: COLORS.textDark }}>
                        Pre-existing Conditions
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          size="small"
                          placeholder="e.g., Diabetes, Hypertension"
                          value={tempCondition}
                          onChange={(e) => setTempCondition(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleAddCondition}
                          disabled={!tempCondition.trim()}
                          startIcon={<AddIcon />}
                          sx={{ borderColor: COLORS.primary, color: COLORS.primary }}
                        >
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.pre_existing_conditions.map((condition) => (
                          <Chip
                            key={condition}
                            label={condition}
                            onDelete={() => handleRemoveCondition(condition)}
                            deleteIcon={<CloseIcon />}
                            sx={{
                              bgcolor: alpha(COLORS.warning, 0.1),
                              color: COLORS.warning,
                              '& .MuiChip-deleteIcon': {
                                color: COLORS.warning,
                              },
                            }}
                          />
                        ))}
                        {formData.pre_existing_conditions.length === 0 && (
                          <Typography variant="body2" color="textSecondary">
                            No pre-existing conditions added
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {/* Step 2: Claim Details */}
                {index === 2 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.disease}>
                        <InputLabel>Disease / Condition to Evaluate</InputLabel>
                        <Select
                          value={formData.disease}
                          onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                          input={<OutlinedInput label="Disease / Condition to Evaluate" />}
                        >
                          {diseases.map((disease) => (
                            <MenuItem key={disease.value} value={disease.value}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>{disease.label}</span>
                                <Chip
                                  label={disease.category}
                                  size="small"
                                  sx={{ ml: 2, bgcolor: alpha(COLORS.primary, 0.1) }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.disease && <FormHelperText>{errors.disease}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === 2 ? handleSubmit : handleNext}
                    sx={{
                      mt: 1,
                      mr: 1,
                      bgcolor: COLORS.primary,
                      '&:hover': { bgcolor: COLORS.secondary },
                    }}
                    disabled={isAnalyzing || (index === 2 && !uploadedFile)}
                  >
                    {index === 2 ? 'Evaluate Claim' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Summary when complete */}
        {activeStep === steps.length && (
          <Box sx={{ mt: 2, p: 3, bgcolor: alpha(COLORS.primary, 0.05), borderRadius: '16px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.primary, mb: 2 }}>
              Form Complete! Review Summary:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Age</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.age} years</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Days Since Enrollment</Typography>
                <Typography variant="body1" fontWeight={500}>{daysDiff} days</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Pre-existing Conditions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {formData.pre_existing_conditions.length > 0 ? (
                    formData.pre_existing_conditions.map((c) => (
                      <Chip key={c} label={c} size="small" sx={{ bgcolor: alpha(COLORS.warning, 0.1) }} />
                    ))
                  ) : (
                    <Typography variant="body2">None</Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Claiming for</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {diseases.find(d => d.value === formData.disease)?.label || formData.disease}
                </Typography>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 3, bgcolor: COLORS.primary }}
              disabled={isAnalyzing || !uploadedFile}
              startIcon={<CheckCircleIcon />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Evaluate Claim'}
            </Button>
          </Box>
        )}
      </FormSection>
    </LocalizationProvider>
  );
};

export default ClaimForm;