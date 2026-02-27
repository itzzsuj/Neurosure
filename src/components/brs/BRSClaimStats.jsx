import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  LinearProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmergencyIcon from '@mui/icons-material/Emergency';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatsCard = styled(Paper)({
  padding: '20px',
  borderRadius: '20px',
  height: '100%',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const StatItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '12px',
  background: alpha(COLORS.primary, 0.02),
});

const BRSClaimStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      label: 'Total Claims',
      value: stats.total,
      icon: <DescriptionIcon sx={{ color: COLORS.primary }} />,
      color: COLORS.primary,
    },
    {
      label: 'Approval Rate',
      value: `${stats.approvalRate}%`,
      icon: <CheckCircleIcon sx={{ color: COLORS.success }} />,
      color: COLORS.success,
    },
    {
      label: 'Emergency %',
      value: `${stats.emergencyRatio}%`,
      icon: <EmergencyIcon sx={{ color: COLORS.warning }} />,
      color: COLORS.warning,
    },
    {
      label: 'Avg Amount',
      value: `₹${(stats.avgAmount / 1000).toFixed(1)}K`,
      icon: <AttachMoneyIcon sx={{ color: COLORS.info }} />,
      color: COLORS.info,
    },
  ];

  return (
    <StatsCard>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Claim Statistics
      </Typography>

      <Grid container spacing={2}>
        {statItems.map((item, index) => (
          <Grid item xs={6} key={index}>
            <StatItem>
              <Box sx={{ minWidth: 36 }}>{item.icon}</Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ color: item.color, fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            </StatItem>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Approved vs Total
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 60 }}>
            {stats.approved}/{stats.total}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.approvalRate}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(COLORS.success, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: COLORS.success,
              },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.success }}>
            {stats.approvalRate}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Emergency Ratio
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 60 }}>
            {stats.emergencyCount}/{stats.total}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.emergencyRatio}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(COLORS.warning, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: COLORS.warning,
              },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.warning }}>
            {stats.emergencyRatio}%
          </Typography>
        </Box>
      </Box>
    </StatsCard>
  );
};

export default BRSClaimStats;