import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Zoom,
  LinearProgress,
  Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InfoIcon from '@mui/icons-material/Info';

const MetricCardStyled = styled(Card)(({ color, gradient }) => ({
  borderRadius: '24px',
  background: gradient || `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, white 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: color,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(color, 0.3)}`,
  },
}));

const DetailDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: '#1E1E1E',
    color: '#FFFFFF',
    maxWidth: '900px',
    width: '100%',
  },
});

const DetailContent = styled(Box)({
  padding: '24px',
  background: '#1E1E1E',
  color: '#FFFFFF',
  fontFamily: "'Roboto Mono', monospace",
  fontSize: '0.9rem',
  maxHeight: '600px',
  overflow: 'auto',
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    color: '#FFFFFF',
    fontFamily: "'Roboto Mono', monospace",
    lineHeight: 1.6,
  },
  '& .positive': { color: '#4CAF50' },
  '& .negative': { color: '#F44336' },
  '& .neutral': { color: '#FFC107' },
});

const ScoreRing = styled(Box)(({ score, color }) => ({
  position: 'relative',
  display: 'inline-flex',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: `conic-gradient(${color} ${score * 360}deg, ${alpha(color, 0.1)} 0deg)`,
  margin: '0 auto',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '8px',
    left: '8px',
    right: '8px',
    bottom: '8px',
    borderRadius: '50%',
    background: 'white',
  },
  '&::after': {
    content: `"${Math.round(score * 100)}%"`,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '20px',
    fontWeight: 'bold',
    color: color,
  },
}));

const EnhancedMetricCard = ({ 
  title, 
  score, 
  icon, 
  color, 
  gradient,
  description,
  detailedReport,
  type,
  interpretation,
  trend
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon sx={{ color: COLORS.success }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ color: COLORS.rejected }} />;
    return <TrendingFlatIcon sx={{ color: COLORS.warning }} />;
  };

  return (
    <>
      <MetricCardStyled color={color} gradient={gradient} onClick={handleClick}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textDark }}>
                {title}
              </Typography>
            </Box>
            <Tooltip title="Click for detailed analysis">
              <InfoIcon sx={{ color: alpha(COLORS.textDark, 0.4), cursor: 'pointer' }} />
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ScoreRing score={score} color={color} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
                {Math.round(score * 100)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {getTrendIcon()}
                <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                  {interpretation}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.7), mb: 2 }}>
            {description}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={score * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(color, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
        </CardContent>
      </MetricCardStyled>

      <DetailDialog open={open} onClose={handleClose} TransitionComponent={Zoom}>
        <DialogTitle sx={{ 
          bgcolor: '#2A2A2A', 
          color: 'white',
          borderBottom: `1px solid ${alpha(color, 0.3)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6">{title} - Detailed Analysis</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: '#1E1E1E' }}>
          <DetailContent>
            <pre>
              {detailedReport || 'No detailed analysis available'}
            </pre>
          </DetailContent>
        </DialogContent>
      </DetailDialog>
    </>
  );
};

export default EnhancedMetricCard;