import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const StatCard = styled(Paper)(({ color }) => ({
  padding: '20px',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, white 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
  },
}));

const IconWrapper = styled(Box)(({ color }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(color, 0.2),
  color: color,
}));

const VaultStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: <PeopleIcon />,
      color: COLORS.primary,
    },
    {
      label: 'Total Claims',
      value: stats.totalClaims,
      icon: <DescriptionIcon />,
      color: COLORS.info,
    },
    {
      label: 'Approval Rate',
      value: `${stats.approvalRate.toFixed(1)}%`,
      icon: <CheckCircleIcon />,
      color: COLORS.success,
    },
    {
      label: 'High Risk',
      value: stats.highRiskCount,
      icon: <WarningIcon />,
      color: COLORS.warning,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard color={item.color}>
            <IconWrapper color={item.color}>{item.icon}</IconWrapper>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: item.color, lineHeight: 1.2 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.label}
              </Typography>
            </Box>
          </StatCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default VaultStats;