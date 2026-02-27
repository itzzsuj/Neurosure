import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

// Icons
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import HealingIcon from '@mui/icons-material/Healing';

const ConstraintCardStyled = styled(Card)(({ type, contradiction }) => ({
  borderRadius: '16px',
  marginBottom: '12px',
  border: `1px solid ${contradiction 
    ? alpha(COLORS.rejected, 0.3) 
    : alpha(COLORS.primary, 0.1)}`,
  background: contradiction 
    ? alpha(COLORS.rejected, 0.02)
    : 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 8px 24px ${alpha(
      contradiction ? COLORS.rejected : COLORS.primary, 
      0.12
    )}`,
  },
}));

const TypeIcon = ({ type }) => {
  switch(type) {
    case 'waiting_period':
      return <AccessTimeIcon sx={{ color: COLORS.waiting }} />;
    case 'age_limit':
      return <PersonIcon sx={{ color: COLORS.age }} />;
    case 'pre_existing':
      return <WarningIcon sx={{ color: COLORS.preExisting }} />;
    case 'disease_coverage':
      return <HealingIcon sx={{ color: COLORS.disease }} />;
    default:
      return <ErrorIcon sx={{ color: COLORS.grey }} />;
  }
};

const ConstraintCard = ({ constraint, alignment }) => {
  const getTypeLabel = (type) => {
    switch(type) {
      case 'waiting_period': return 'Waiting Period';
      case 'age_limit': return 'Age Limit';
      case 'pre_existing': return 'Pre-existing';
      case 'disease_coverage': return 'Disease Coverage';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'waiting_period': return COLORS.waiting;
      case 'age_limit': return COLORS.age;
      case 'pre_existing': return COLORS.preExisting;
      case 'disease_coverage': return COLORS.disease;
      default: return COLORS.grey;
    }
  };

  return (
    <ConstraintCardStyled 
      type={constraint.type} 
      contradiction={alignment?.contradiction}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TypeIcon type={constraint.type} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: getTypeColor(constraint.type) }}>
              {getTypeLabel(constraint.type)}
            </Typography>
          </Box>
          {alignment?.contradiction && (
            <Chip
              icon={<WarningIcon />}
              label="CONTRADICTION"
              size="small"
              sx={{
                bgcolor: alpha(COLORS.rejected, 0.1),
                color: COLORS.rejected,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {/* Clause Text */}
        <Typography variant="body2" sx={{ mb: 2, color: COLORS.textDark, lineHeight: 1.6 }}>
          {constraint.clause_text}
        </Typography>

        {/* Constraint Details */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {constraint.condition && (
            <Chip
              label={`Condition: ${constraint.condition}`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.primary, 0.05) }}
            />
          )}
          {constraint.period_days && (
            <Chip
              icon={<CalendarTodayIcon />}
              label={`${constraint.period_days} days`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.waiting, 0.05), color: COLORS.waiting }}
            />
          )}
          {constraint.min_age && (
            <Chip
              icon={<PersonIcon />}
              label={`Min Age: ${constraint.min_age}`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.age, 0.05), color: COLORS.age }}
            />
          )}
          {constraint.max_age && (
            <Chip
              icon={<PersonIcon />}
              label={`Max Age: ${constraint.max_age}`}
              size="small"
              sx={{ bgcolor: alpha(COLORS.age, 0.05), color: COLORS.age }}
            />
          )}
        </Box>

        {/* Alignment Score & Risk */}
        {alignment && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="textSecondary">
                Alignment Score
              </Typography>
              <Typography variant="caption" fontWeight={600} color={alignment.contradiction ? COLORS.rejected : COLORS.success}>
                {Math.round(alignment.alignment_score * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={alignment.alignment_score * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(alignment.contradiction ? COLORS.rejected : COLORS.success, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: alignment.contradiction ? COLORS.rejected : COLORS.success,
                },
              }}
            />
            
            {alignment.contradiction_reason && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: COLORS.rejected }}>
                ⚠️ {alignment.contradiction_reason}
              </Typography>
            )}
          </Box>
        )}

        {/* Page Reference */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            label={`Page ${constraint.page}`}
            size="small"
            variant="outlined"
            sx={{ borderColor: alpha(COLORS.primary, 0.3) }}
          />
        </Box>
      </CardContent>
    </ConstraintCardStyled>
  );
};

export default ConstraintCard;