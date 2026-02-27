import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';
import EnhancedMetricCard from './EnhancedMetricCard';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import GavelIcon from '@mui/icons-material/Gavel';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

const DecisionHeader = styled(Box)(({ decision }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  padding: '24px',
  borderRadius: '16px',
  background: decision === 'ACCEPTED' 
    ? `linear-gradient(135deg, ${alpha(COLORS.accepted, 0.1)} 0%, ${alpha(COLORS.accepted, 0.02)} 100%)`
    : `linear-gradient(135deg, ${alpha(COLORS.rejected, 0.1)} 0%, ${alpha(COLORS.rejected, 0.02)} 100%)`,
  border: `1px solid ${
    decision === 'ACCEPTED' ? COLORS.accepted : COLORS.rejected
  }`,
  marginBottom: '24px',
}));

const StatsCard = styled(Box)({
  padding: '16px',
  borderRadius: '12px',
  background: alpha(COLORS.primary, 0.03),
  textAlign: 'center',
});

const DecisionCard = ({ result, onReset, detailedReports }) => {
  if (!result) return null;

  const decision = result?.decision || result?.summary?.decision || 'INCONCLUSIVE';
  const reason = result?.reason || result?.summary?.reason || 'No reason provided';
  const confidence = result?.confidence || result?.summary?.confidence || 0;
  
  const cds_score = result?.cds_score ?? 0;
  const erg_score = result?.erg_score ?? 0;
  const pai_score = result?.pai_score ?? 0;
  
  const totalClauses = result?.summary?.total_clauses || result?.clauses?.length || 0;
  const contradictions = result?.alignment?.contradiction_count || 0;
  const totalConstraints = result?.alignment?.total_constraints || 0;

  return (
    <Card sx={{ borderRadius: '24px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Decision Header */}
        <DecisionHeader decision={decision}>
          {decision === 'ACCEPTED' ? (
            <CheckCircleIcon sx={{ fontSize: 64, color: COLORS.accepted }} />
          ) : (
            <CancelIcon sx={{ fontSize: 64, color: COLORS.rejected }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: decision === 'ACCEPTED' ? COLORS.accepted : COLORS.rejected }}>
              {decision}
            </Typography>
            <Typography variant="h6" sx={{ color: COLORS.textDark, mt: 1 }}>
              {reason}
            </Typography>
          </Box>
        </DecisionHeader>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary }}>
                {totalClauses}
              </Typography>
              <Typography variant="caption">Total Clauses</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary }}>
                {totalConstraints}
              </Typography>
              <Typography variant="caption">Constraints</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <Typography variant="h4" sx={{ fontWeight: 700, color: contradictions > 0 ? COLORS.rejected : COLORS.success }}>
                {contradictions}
              </Typography>
              <Typography variant="caption">Contradictions</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.info }}>
                {Math.round(confidence * 100)}%
              </Typography>
              <Typography variant="caption">Confidence</Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Confidence Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>Decision Confidence</Typography>
            <Typography variant="body2" fontWeight={600} color={decision === 'ACCEPTED' ? COLORS.accepted : COLORS.rejected}>
              {Math.round(confidence * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={confidence * 100}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(decision === 'ACCEPTED' ? COLORS.accepted : COLORS.rejected, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: decision === 'ACCEPTED' ? COLORS.accepted : COLORS.rejected,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Metric Cards */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Detailed Metrics (Click for Analysis)
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <EnhancedMetricCard
              title="CDS"
              score={cds_score}
              icon={<VerifiedIcon sx={{ color: COLORS.success }} />}
              color={COLORS.success}
              description="Coverage Density Score measures how well the policy covers the condition"
              detailedReport={result?.detailed_report}
              type="cds"
              interpretation="Higher is better"
              trend={cds_score >= 0.7 ? 'up' : cds_score >= 0.4 ? 'neutral' : 'down'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <EnhancedMetricCard
              title="ERG"
              score={erg_score}
              icon={<WarningIcon sx={{ color: COLORS.warning }} />}
              color={COLORS.warning}
              description="Exclusion Risk Gradient indicates likelihood of claim rejection"
              detailedReport={result?.detailed_report}
              type="erg"
              interpretation="Lower is better"
              trend={erg_score <= 0.3 ? 'down' : erg_score <= 0.6 ? 'neutral' : 'up'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <EnhancedMetricCard
              title="PAI"
              score={pai_score}
              icon={<GavelIcon sx={{ color: COLORS.info }} />}
              color={COLORS.info}
              description="Policy Ambiguity Index measures vagueness in policy language"
              detailedReport={result?.detailed_report}
              type="pai"
              interpretation="Lower is clearer"
              trend={pai_score <= 0.3 ? 'down' : pai_score <= 0.6 ? 'neutral' : 'up'}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              borderColor: alpha(COLORS.primary, 0.3),
              color: COLORS.primary,
              '&:hover': {
                borderColor: COLORS.primary,
                bgcolor: alpha(COLORS.primary, 0.05),
              },
            }}
          >
            New Evaluation
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.secondary },
            }}
          >
            Export Report
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DecisionCard;