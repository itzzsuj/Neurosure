import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const ScoreCard = styled(Paper)({
  padding: '24px',
  borderRadius: '24px',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
});

const ScoreRing = styled(Box)(({ score, color }) => ({
  position: 'relative',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: `conic-gradient(${color} ${score * 360}deg, ${alpha(color, 0.1)} 0deg)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'white',
  },
  '&::after': {
    content: `"${Math.round(score * 100)}%"`,
    position: 'absolute',
    fontSize: '24px',
    fontWeight: 'bold',
    color: color,
  },
}));

const getRiskColor = (brsClass) => {
  switch(brsClass) {
    case 'High': return COLORS.success;
    case 'Medium': return COLORS.warning;
    case 'Low': return COLORS.rejected;
    default: return COLORS.grey;
  }
};

const getRiskIcon = (brsClass) => {
  switch(brsClass) {
    case 'High': return <CheckCircleIcon sx={{ color: COLORS.success }} />;
    case 'Medium': return <WarningIcon sx={{ color: COLORS.warning }} />;
    case 'Low': return <ErrorIcon sx={{ color: COLORS.rejected }} />;
    default: return <PsychologyIcon sx={{ color: COLORS.grey }} />;
  }
};

const BRSScoreCard = ({ patient, brsScore, brsClass, confidence, modelAccuracy = 0.908 }) => {
  const riskColor = getRiskColor(brsClass);
  const riskIcon = getRiskIcon(brsClass);

  return (
    <ScoreCard>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon sx={{ color: COLORS.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Behavioral Reliability Score
          </Typography>
        </Box>
        <Tooltip title={`XGBoost model trained on French MTPL dataset with ${(modelAccuracy * 100).toFixed(1)}% accuracy`}>
          <InfoIcon sx={{ color: alpha(COLORS.textDark, 0.4), cursor: 'help' }} />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <ScoreRing score={brsScore} color={riskColor} />
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {riskIcon}
            <Typography variant="h4" sx={{ color: riskColor, fontWeight: 700 }}>
              {brsClass} Reliability
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Patient: {patient?.name} ({patient?.patientId})
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Primary Condition: {patient?.primaryCondition}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Confidence: ${Math.round(confidence * 100)}%`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary }}
            />
            <Chip
              label={`Claims: ${patient?.claims?.length || 0}`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.info, 0.1), color: COLORS.info }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Reliability Score</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: riskColor }}>
            {Math.round(brsScore * 100)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={brsScore * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(riskColor, 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: riskColor,
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="textSecondary">
          🎯 Model Accuracy: {(modelAccuracy * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="textSecondary">
          • XGBoost with 26 features
        </Typography>
      </Box>
    </ScoreCard>
  );
};

export default BRSScoreCard;