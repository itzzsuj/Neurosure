import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../../styles/colors';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const AssessmentCard = styled(Paper)({
  padding: '20px',
  borderRadius: '20px',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

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
    default: return <LightbulbIcon />;
  }
};

const BRSRiskAssessment = ({ brsClass, riskFactors, claimStats }) => {
  const riskColor = getRiskColor(brsClass);
  const riskIcon = getRiskIcon(brsClass);

  const getAssessmentText = () => {
    switch(brsClass) {
      case 'High':
        return 'This patient demonstrates highly reliable behavior with consistent claim patterns and high approval rates.';
      case 'Medium':
        return 'This patient shows moderate reliability. Some concerning patterns detected but overall manageable risk.';
      case 'Low':
        return 'This patient exhibits high-risk behavior with multiple red flags. Requires careful review before approval.';
      default:
        return 'Unable to determine risk level.';
    }
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (brsClass === 'High') {
      recs.push('✓ Fast-track approval recommended');
      recs.push('✓ Eligible for premium discounts');
      recs.push('✓ Low monitoring priority');
    } else if (brsClass === 'Medium') {
      recs.push('• Standard review process');
      recs.push('• Monitor for pattern changes');
      recs.push('• Consider preventive care programs');
    } else {
      recs.push('⚠️ Enhanced due diligence required');
      recs.push('⚠️ Review all claims manually');
      recs.push('⚠️ Consider fraud prevention measures');
    }
    
    return recs;
  };

  return (
    <AssessmentCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {riskIcon}
        <Typography variant="h6" sx={{ color: riskColor, fontWeight: 700 }}>
          {brsClass} Risk Assessment
        </Typography>
      </Box>

      <Alert 
        severity={brsClass === 'High' ? 'success' : brsClass === 'Medium' ? 'warning' : 'error'}
        sx={{ mb: 3, borderRadius: '12px' }}
      >
        {getAssessmentText()}
      </Alert>

      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LightbulbIcon sx={{ fontSize: 18, color: COLORS.warning }} />
        Recommendations:
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {getRecommendations().map((rec, index) => (
          <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
            {rec}
          </Typography>
        ))}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {claimStats?.approvalRate > 80 && (
          <Chip
            label="✅ High Approval Rate"
            size="small"
            sx={{ bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}
          />
        )}
        {claimStats?.emergencyRatio > 40 && (
          <Chip
            label="⚠️ High Emergency Rate"
            size="small"
            sx={{ bgcolor: alpha(COLORS.warning, 0.1), color: COLORS.warning }}
          />
        )}
        {claimStats?.total === 0 && (
          <Chip
            label="🆕 No Claim History"
            size="small"
            sx={{ bgcolor: alpha(COLORS.info, 0.1), color: COLORS.info }}
          />
        )}
      </Box>
    </AssessmentCard>
  );
};

export default BRSRiskAssessment;