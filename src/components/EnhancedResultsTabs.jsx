import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Badge,
  Typography,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';
import ConstraintCard from './ConstraintCard';
import ContradictionsTab from './ContradictionsTab';
import MatchingClausesTab from './MatchingClausesTab';

// Icons
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import HealingIcon from '@mui/icons-material/Healing';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const StyledTabs = styled(Tabs)({
  borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minHeight: '48px',
  },
});

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    style={{ height: '100%' }}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const StyledBadge = styled(Badge)(({ color }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    fontSize: '0.75rem',
  },
}));

const EnhancedResultsTabs = ({ constraints, alignments, patient }) => {
  const [tabValue, setTabValue] = useState(0);

  // Group constraints by type
  const groupedConstraints = {
    all: constraints || [],
    disease: (constraints || []).filter(c => c.type === 'disease_coverage'),
    pre_existing: (constraints || []).filter(c => c.type === 'pre_existing'),
    waiting: (constraints || []).filter(c => c.type === 'waiting_period'),
    age: (constraints || []).filter(c => c.type === 'age_limit'),
  };

  // Count contradictions
  const contradictions = alignments?.filter(a => a.contradiction) || [];
  const matches = alignments?.filter(a => !a.contradiction && a.alignment_score > 0.5) || [];

  // Create alignment map
  const alignmentMap = {};
  alignments?.forEach(a => {
    if (a.constraint?.clause_id) {
      alignmentMap[a.constraint.clause_id] = a;
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabs = [
    { 
      label: 'All', 
      icon: <AllInclusiveIcon />, 
      color: COLORS.primary,
      count: groupedConstraints.all.length,
    },
    { 
      label: 'Disease', 
      icon: <HealingIcon />, 
      color: COLORS.disease,
      count: groupedConstraints.disease.length,
    },
    { 
      label: 'Pre-existing', 
      icon: <WarningIcon />, 
      color: COLORS.preExisting,
      count: groupedConstraints.pre_existing.length,
    },
    { 
      label: 'Waiting Period', 
      icon: <AccessTimeIcon />, 
      color: COLORS.waiting,
      count: groupedConstraints.waiting.length,
    },
    { 
      label: 'Age', 
      icon: <PersonIcon />, 
      color: COLORS.age,
      count: groupedConstraints.age.length,
    },
    { 
      label: 'Contradictions', 
      icon: <FlagIcon />, 
      color: COLORS.rejected,
      count: contradictions.length,
    },
    { 
      label: 'Matching', 
      icon: <ThumbUpIcon />, 
      color: COLORS.success,
      count: matches.length,
    },
  ];

  return (
    <Paper sx={{ borderRadius: '24px', bgcolor: 'white', p: 3 }}>
      <StyledTabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: tab.color }}>{tab.icon}</Box>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge
                    badgeContent={tab.count}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: alpha(tab.color, 0.1),
                        color: tab.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 18,
                        minWidth: 18,
                      },
                    }}
                  />
                )}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                color: tab.color,
              },
            }}
          />
        ))}
      </StyledTabs>

      {/* Regular constraint tabs */}
      {tabs.slice(0, 5).map((tab, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          {groupedConstraints[Object.keys(groupedConstraints)[index]].length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="textSecondary">
                No {tab.label.toLowerCase()} constraints found
              </Typography>
            </Box>
          ) : (
            groupedConstraints[Object.keys(groupedConstraints)[index]].map((constraint, idx) => (
              <ConstraintCard
                key={idx}
                constraint={constraint}
                alignment={alignmentMap[constraint.clause_id]}
              />
            ))
          )}
        </TabPanel>
      ))}

      {/* Contradictions Tab */}
      <TabPanel value={tabValue} index={5}>
        <ContradictionsTab alignments={alignments} />
      </TabPanel>

      {/* Matching Clauses Tab */}
      <TabPanel value={tabValue} index={6}>
        <MatchingClausesTab alignments={alignments} patient={patient} />
      </TabPanel>
    </Paper>
  );
};

export default EnhancedResultsTabs;