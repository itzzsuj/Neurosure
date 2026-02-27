import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';
import ConstraintCard from './ConstraintCard';

// Icons
import HealingIcon from '@mui/icons-material/Healing';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const StyledTabs = styled(Tabs)({
  borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minHeight: '48px',
  },
});

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TabLabel = ({ label, count, icon, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ color: color }}>{icon}</Box>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    {count > 0 && (
      <Chip
        label={count}
        size="small"
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 20,
          minWidth: 20,
        }}
      />
    )}
  </Box>
);

const ResultsTabs = ({ constraints, alignments }) => {
  const [tabValue, setTabValue] = useState(0);

  // Group constraints by type
  const groupedConstraints = {
    all: constraints || [],
    disease: (constraints || []).filter(c => c.type === 'disease_coverage'),
    pre_existing: (constraints || []).filter(c => c.type === 'pre_existing'),
    waiting: (constraints || []).filter(c => c.type === 'waiting_period'),
    age: (constraints || []).filter(c => c.type === 'age_limit'),
  };

  // Create a map of alignments by constraint id for easy lookup
  const alignmentMap = {};
  if (alignments) {
    alignments.forEach(a => {
      if (a.constraint && a.constraint.clause_id) {
        alignmentMap[a.constraint.clause_id] = a;
      }
    });
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabs = [
    { 
      label: 'All', 
      icon: <AllInclusiveIcon />, 
      color: COLORS.primary,
      count: groupedConstraints.all.length,
      data: groupedConstraints.all 
    },
    { 
      label: 'Disease', 
      icon: <HealingIcon />, 
      color: COLORS.disease,
      count: groupedConstraints.disease.length,
      data: groupedConstraints.disease 
    },
    { 
      label: 'Pre-existing', 
      icon: <WarningIcon />, 
      color: COLORS.preExisting,
      count: groupedConstraints.pre_existing.length,
      data: groupedConstraints.pre_existing 
    },
    { 
      label: 'Waiting Period', 
      icon: <AccessTimeIcon />, 
      color: COLORS.waiting,
      count: groupedConstraints.waiting.length,
      data: groupedConstraints.waiting 
    },
    { 
      label: 'Age', 
      icon: <PersonIcon />, 
      color: COLORS.age,
      count: groupedConstraints.age.length,
      data: groupedConstraints.age 
    },
  ];

  return (
    <Paper sx={{ borderRadius: '24px', bgcolor: 'white', p: 3 }}>
      <StyledTabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={<TabLabel {...tab} />}
            sx={{
              '&.Mui-selected': {
                color: tab.color,
              },
            }}
          />
        ))}
      </StyledTabs>

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          {tab.data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="textSecondary">
                No {tab.label.toLowerCase()} constraints found
              </Typography>
            </Box>
          ) : (
            tab.data.map((constraint, idx) => (
              <ConstraintCard
                key={idx}
                constraint={constraint}
                alignment={alignmentMap[constraint.clause_id]}
              />
            ))
          )}
        </TabPanel>
      ))}
    </Paper>
  );
};

export default ResultsTabs;