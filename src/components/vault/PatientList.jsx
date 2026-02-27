import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PatientCard from './PatientCard';

const PatientList = ({ patients, onView, onDelete, tabValue }) => {
  // Filter based on tab
  const getFilteredPatients = () => {
    if (tabValue === 0) return patients;
    
    if (tabValue === 1) {
      // High risk patients
      return patients.filter(p => {
        const claims = p.claims || [];
        const approved = claims.filter(c => c.approved).length;
        const approvalRate = claims.length > 0 ? approved / claims.length : 1;
        return approvalRate < 0.5 || (p.brsScore || 0) < 0.4;
      });
    }
    
    if (tabValue === 2) {
      // Recent claims (patients with claims in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return patients.filter(p => {
        const claims = p.claims || [];
        return claims.some(c => new Date(c.date) >= thirtyDaysAgo);
      });
    }
    
    return patients;
  };

  const filteredPatients = getFilteredPatients();

  if (filteredPatients.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
        <Typography variant="body1" color="textSecondary">
          No patients found
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {filteredPatients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

export default PatientList;