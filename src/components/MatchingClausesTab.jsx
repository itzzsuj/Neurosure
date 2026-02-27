import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';  // 🔥 ADD THIS MISSING IMPORT

const MatchCard = styled(Card)({
  borderRadius: '16px',
  marginBottom: '16px',
  border: `1px solid ${alpha(COLORS.success, 0.2)}`,
  background: `linear-gradient(135deg, ${alpha(COLORS.success, 0.02)} 0%, white 100%)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 8px 24px ${alpha(COLORS.success, 0.15)}`,
  },
});

const MatchingClausesTab = ({ alignments, patient }) => {
  if (!alignments) return null;

  const matches = alignments.filter(a => !a.contradiction && a.alignment_score > 0.5);

  if (matches.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
        <Typography variant="body1" color="textSecondary">
          No matching clauses found for this patient profile
        </Typography>
      </Paper>
    );
  }

  const getMatchQuality = (score) => {
    if (score >= 0.9) return { label: 'Excellent', color: COLORS.success };
    if (score >= 0.7) return { label: 'Good', color: COLORS.info };
    if (score >= 0.5) return { label: 'Fair', color: COLORS.warning };
    return { label: 'Poor', color: COLORS.grey };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <ThumbUpIcon sx={{ color: COLORS.success }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Supporting Clauses ({matches.length})
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha(COLORS.success, 0.03) }}>
            <Typography variant="subtitle2" gutterBottom>
              Patient Profile Summary
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {patient && (
                <>
                  <Chip icon={<PersonIcon />} label={`Age: ${patient.age}`} />
                  <Chip icon={<CalendarTodayIcon />} label={`Days enrolled: ${patient.days_since_enrollment}`} />
                  {patient.pre_existing_conditions?.map((cond, i) => (
                    <Chip key={i} label={cond} size="small" sx={{ bgcolor: alpha(COLORS.warning, 0.1) }} />
                  ))}
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {matches.map((match, index) => {
        const constraint = match.constraint || {};
        const quality = getMatchQuality(match.alignment_score);

        return (
          <MatchCard key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: COLORS.success }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: COLORS.success }}>
                    {constraint.type?.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
                <Chip
                  label={`Match: ${quality.label}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(quality.color, 0.1),
                    color: quality.color,
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 2, color: COLORS.textDark, lineHeight: 1.6 }}>
                {constraint.clause_text?.substring(0, 300)}...
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">Alignment Score</Typography>
                  <Typography variant="caption" fontWeight={600} color={quality.color}>
                    {Math.round(match.alignment_score * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={match.alignment_score * 100}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(quality.color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: quality.color,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {constraint.condition && (
                  <Chip
                    icon={<LocalHospitalIcon />}
                    label={`Condition: ${constraint.condition}`}
                    size="small"
                    sx={{ bgcolor: alpha(COLORS.primary, 0.05) }}
                  />
                )}
                <Chip
                  label={`Page ${constraint.page || 1}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </MatchCard>
        );
      })}
    </Box>
  );
};

export default MatchingClausesTab;