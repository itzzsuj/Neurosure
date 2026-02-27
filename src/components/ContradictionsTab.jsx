import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

// Icons
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import HealingIcon from '@mui/icons-material/Healing';
import GavelIcon from '@mui/icons-material/Gavel';
import FlagIcon from '@mui/icons-material/Flag';

const ContradictionCard = styled(Card)({
  borderRadius: '16px',
  marginBottom: '16px',
  border: `1px solid ${alpha(COLORS.rejected, 0.3)}`,
  background: `linear-gradient(135deg, ${alpha(COLORS.rejected, 0.02)} 0%, white 100%)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 8px 24px ${alpha(COLORS.rejected, 0.2)}`,
  },
});

const RiskBadge = styled(Chip)(({ level }) => ({
  background: level === 'high' 
    ? alpha(COLORS.rejected, 0.1)
    : level === 'medium'
      ? alpha(COLORS.warning, 0.1)
      : alpha(COLORS.info, 0.1),
  color: level === 'high'
    ? COLORS.rejected
    : level === 'medium'
      ? COLORS.warning
      : COLORS.info,
  fontWeight: 600,
}));

const ContradictionsTab = ({ alignments }) => {
  if (!alignments) return null;

  const contradictions = alignments.filter(a => a.contradiction);

  if (contradictions.length === 0) {
    return (
      <Alert severity="success" sx={{ borderRadius: '12px' }}>
        No contradictions found! All constraints are satisfied.
      </Alert>
    );
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'waiting_period': return <AccessTimeIcon />;
      case 'age_limit': return <PersonIcon />;
      case 'pre_existing': return <WarningIcon />;
      case 'disease_coverage': return <HealingIcon />;
      default: return <GavelIcon />;
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

  const getRiskLevel = (risk) => {
    if (risk >= 0.7) return 'high';
    if (risk >= 0.4) return 'medium';
    return 'low';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FlagIcon sx={{ color: COLORS.rejected }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Critical Contradictions ({contradictions.length})
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(COLORS.rejected, 0.03) }}>
            <Typography variant="h4" sx={{ color: COLORS.rejected, fontWeight: 700 }}>
              {contradictions.length}
            </Typography>
            <Typography variant="caption">Total Contradictions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(COLORS.warning, 0.03) }}>
            <Typography variant="h4" sx={{ color: COLORS.warning, fontWeight: 700 }}>
              {contradictions.filter(c => c.risk_level >= 0.7).length}
            </Typography>
            <Typography variant="caption">High Risk</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(COLORS.info, 0.03) }}>
            <Typography variant="h4" sx={{ color: COLORS.info, fontWeight: 700 }}>
              {[...new Set(contradictions.map(c => c.constraint?.type))].length}
            </Typography>
            <Typography variant="caption">Affected Categories</Typography>
          </Paper>
        </Grid>
      </Grid>

      {contradictions.map((contradiction, index) => {
        const constraint = contradiction.constraint || {};
        const type = constraint.type || 'unknown';
        const riskLevel = getRiskLevel(contradiction.risk_level);

        return (
          <ContradictionCard key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: getTypeColor(type) }}>{getTypeIcon(type)}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: getTypeColor(type) }}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
                <RiskBadge 
                  label={`Risk: ${Math.round(contradiction.risk_level * 100)}%`}
                  level={riskLevel}
                  size="small"
                />
              </Box>

              <Alert 
                severity="error" 
                icon={<WarningIcon />}
                sx={{ mb: 2, borderRadius: '8px' }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {contradiction.contradiction_reason || 'Policy contradiction detected'}
                </Typography>
              </Alert>

              <Typography variant="body2" sx={{ mb: 2, color: COLORS.textDark, lineHeight: 1.6 }}>
                {constraint.clause_text?.substring(0, 300)}...
              </Typography>

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
                    label={`Period: ${constraint.period_days} days`}
                    size="small"
                    sx={{ bgcolor: alpha(COLORS.waiting, 0.05) }}
                  />
                )}
                {constraint.min_age && (
                  <Chip
                    label={`Min Age: ${constraint.min_age}`}
                    size="small"
                    sx={{ bgcolor: alpha(COLORS.age, 0.05) }}
                  />
                )}
                {constraint.max_age && (
                  <Chip
                    label={`Max Age: ${constraint.max_age}`}
                    size="small"
                    sx={{ bgcolor: alpha(COLORS.age, 0.05) }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={`Page ${constraint.page || 1}`}
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.5) }}>
                  Similarity: {Math.round((constraint.similarity_score || 0) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </ContradictionCard>
        );
      })}
    </Box>
  );
};

export default ContradictionsTab;