import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Box,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

const FormPaper = styled(Paper)({
  padding: '20px',
  borderRadius: '12px',
  background: alpha(COLORS.primary, 0.02),
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const AddClaimForm = ({ onSubmit, onCancel }) => {
  const [claimData, setClaimData] = useState({
    date: new Date().toISOString().split('T')[0],
    claimType: 'routine',
    diagnosis: '',
    amount: '',
    approved: true,
  });

  const claimTypes = [
    'routine',
    'emergency',
    'hospitalization',
    'outpatient',
    'surgery',
    'diagnostic',
    'medication',
    'therapy',
    'specialist'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(claimData);
  };

  return (
    <FormPaper>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Add New Claim
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Claim Date"
              type="date"
              value={claimData.date}
              onChange={(e) => setClaimData({ ...claimData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Claim Type"
              value={claimData.claimType}
              onChange={(e) => setClaimData({ ...claimData, claimType: e.target.value })}
              required
              size="small"
            >
              {claimTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Diagnosis"
              value={claimData.diagnosis}
              onChange={(e) => setClaimData({ ...claimData, diagnosis: e.target.value })}
              placeholder="e.g., Chest pain, Follow-up, etc."
              required
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Claim Amount (₹)"
              type="number"
              value={claimData.amount}
              onChange={(e) => setClaimData({ ...claimData, amount: e.target.value })}
              required
              size="small"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={claimData.approved}
                  onChange={(e) => setClaimData({ ...claimData, approved: e.target.checked })}
                  color="primary"
                />
              }
              label="Approved"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                size="small"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                sx={{ bgcolor: COLORS.primary }}
              >
                Add Claim
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormPaper>
  );
};

export default AddClaimForm;