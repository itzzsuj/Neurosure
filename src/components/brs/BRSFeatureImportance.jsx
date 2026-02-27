import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';

const ImportanceCard = styled(Paper)({
  padding: '20px',
  borderRadius: '20px',
  height: '100%',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const FeatureBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '12px',
});

const formatFeatureName = (name) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const BRSFeatureImportance = ({ features }) => {
  if (!features) return null;

  // Sort features by importance
  const sortedFeatures = Object.entries(features)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <ImportanceCard>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Top Predictive Features
        </Typography>
        <Tooltip title="Feature importance from XGBoost model trained on French MTPL data">
          <InfoIcon sx={{ color: alpha(COLORS.textDark, 0.4), cursor: 'help', fontSize: 18 }} />
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2 }}>
        {sortedFeatures.map(([name, value]) => (
          <FeatureBar key={name}>
            <Typography variant="caption" sx={{ minWidth: 100, fontWeight: 500 }}>
              {formatFeatureName(name)}:
            </Typography>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Box
                sx={{
                  height: '24px',
                  width: `${value * 100}%`,
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  borderRadius: '12px',
                  opacity: 0.8,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 600 }}>
              {(value * 100).toFixed(1)}%
            </Typography>
          </FeatureBar>
        ))}
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(COLORS.primary, 0.03), borderRadius: '12px' }}>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: 16 }} />
          Model achieves 90.8% accuracy using these 30+ features
        </Typography>
      </Box>
    </ImportanceCard>
  );
};

export default BRSFeatureImportance;