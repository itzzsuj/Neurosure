import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import COLORS from '../styles/colors';

// Components
import BRSPatientSelector from '../components/brs/BRSPatientSelector';
import BRSScoreCard from '../components/brs/BRSScoreCard';
import BRSClaimStats from '../components/brs/BRSClaimStats';
import BRSFeatureImportance from '../components/brs/BRSFeatureImportance';
import BRSRiskAssessment from '../components/brs/BRSRiskAssessment';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_BASE_URL = 'http://localhost:5000/api';

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
});

const PatientRiskAnalysis = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  // State
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load patients from Firestore
  useEffect(() => {
    if (user) {
      loadPatients();
      fetchModelInfo();
    }
  }, [user]);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brs/model-info`);
      const data = await response.json();
      if (data.success) {
        setModelInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch model info:', err);
    }
  };

  const loadPatients = async () => {
    setLoadingPatients(true);
    setError('');
    
    try {
      const patientsRef = collection(db, 'patients');
      const querySnapshot = await getDocs(patientsRef);
      
      const patientList = [];
      querySnapshot.forEach((doc) => {
        patientList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by name
      patientList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setPatients(patientList);
      
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const analyzePatient = async (patient) => {
    setAnalyzing(true);
    setError('');
    setPatientData(null);
    
    try {
      // Call the BRS API with patient data
      const response = await fetch(`${API_BASE_URL}/brs/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claims: patient.claims || [],
          patient: {
            age: patient.age || 50,
            gender: patient.gender || 'M',
            condition: patient.primaryCondition || 'Unknown'
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Format the response for components
        setPatientData({
          brsScore: data.brs_score,
          brsClass: data.brs_class,
          confidence: data.confidence,
          featureImportance: data.feature_importance,
          claimStats: data.claim_stats,
          modelAccuracy: data.model_accuracy
        });
        
        setSuccess(`Analysis complete for ${patient.name} (${data.brs_class} Reliability)`);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to connect to BRS model. Using fallback calculation.');
      
      // Fallback calculation if API fails
      const claims = patient.claims || [];
      const approved = claims.filter(c => c.approved).length;
      const approvalRate = claims.length > 0 ? approved / claims.length : 1;
      const emergencyCount = claims.filter(c => c.claimType === 'emergency').length;
      const emergencyRatio = claims.length > 0 ? emergencyCount / claims.length : 0;
      
      const brsScore = Math.min(0.95, Math.max(0.2, (approvalRate * 0.7) + (1 - emergencyRatio) * 0.3));
      const brsClass = brsScore > 0.7 ? 'High' : brsScore > 0.4 ? 'Medium' : 'Low';
      
      const totalAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
      
      setPatientData({
        brsScore: Number(brsScore.toFixed(2)),
        brsClass,
        confidence: 0.85,
        featureImportance: {
          'Approval Rate': 0.24,
          'Rejection Rate': 0.17,
          'Emergency Ratio': 0.11,
          'Total Claims': 0.08,
          'Avg Amount': 0.05,
          'Claim Frequency': 0.04
        },
        claimStats: {
          total: claims.length,
          approved,
          approvalRate: claims.length > 0 ? Math.round((approved/claims.length)*100) : 100,
          emergencyCount,
          emergencyRatio: claims.length > 0 ? Math.round((emergencyCount/claims.length)*100) : 0,
          totalAmount,
          avgAmount: claims.length > 0 ? Math.round(totalAmount / claims.length) : 0
        }
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientData(null);
  };

  const handleAnalyze = () => {
    if (selectedPatient) {
      analyzePatient(selectedPatient);
    }
  };

  const handleRefresh = () => {
    loadPatients();
    setSelectedPatient(null);
    setPatientData(null);
    fetchModelInfo();
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading || loadingPatients) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, p: 4 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <PageHeader>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}>
                <PsychologyIcon sx={{ fontSize: 32, mr: 1, verticalAlign: 'middle' }} />
                Patient Risk Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Calculate Behavioral Reliability Score (BRS) using XGBoost model with 90.8% accuracy
              </Typography>
              {modelInfo && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  Model: {modelInfo.model_type} • {modelInfo.feature_count} features
                </Typography>
              )}
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: '20px' }}
            >
              Refresh List
            </Button>
          </PageHeader>

          {/* Error/Success Alerts */}
          {error && <ErrorAlert message={error} onClose={() => setError('')} />}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Patient Selector */}
            <Grid item xs={12} md={5}>
              <BRSPatientSelector
                patients={patients}
                selectedPatient={selectedPatient}
                onSelect={handleSelectPatient}
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
              />
            </Grid>

            {/* Right Column - Results */}
            <Grid item xs={12} md={7}>
              {patientData ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <BRSScoreCard 
                        patient={selectedPatient}
                        brsScore={patientData.brsScore}
                        brsClass={patientData.brsClass}
                        confidence={patientData.confidence}
                        modelAccuracy={patientData.modelAccuracy}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <BRSClaimStats stats={patientData.claimStats} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <BRSFeatureImportance features={patientData.featureImportance} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <BRSRiskAssessment 
                        brsClass={patientData.brsClass}
                        claimStats={patientData.claimStats}
                      />
                    </Grid>
                  </Grid>
                </motion.div>
              ) : (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
                  <PsychologyIcon sx={{ fontSize: 64, color: alpha(COLORS.primary, 0.3), mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Select a Patient
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Choose a patient from the list and click "Calculate BRS Score" 
                    to analyze their behavioral reliability using our 90.8% accurate XGBoost model
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default PatientRiskAnalysis;