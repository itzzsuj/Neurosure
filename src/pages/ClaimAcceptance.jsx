import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Alert,
  Snackbar,
  Typography,
  Paper,
  LinearProgress,
  Fade,
  Button,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import COLORS from '../styles/colors';

// Components
import ClaimForm from '../components/ClaimForm';
import EnhancedResultsTabs from '../components/EnhancedResultsTabs';
import DecisionCard from '../components/DecisionCard';
import LoadingOverlay from '../components/LoadingOverlay';

// Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const API_BASE_URL = 'http://localhost:5000/api/analysis';

const UploadArea = styled(Paper)(({ isdragactive }) => ({
  padding: '40px',
  borderRadius: '24px',
  background: 'white',
  border: `2px dashed ${isdragactive ? COLORS.primary : alpha(COLORS.primary, 0.3)}`,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: COLORS.primary,
    background: alpha(COLORS.primary, 0.02),
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.1)}`,
  },
}));

const ClaimAcceptance = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  // State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [jobId, setJobId] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load diseases
  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/diseases`);
        const data = await response.json();
        if (data.success) {
          setDiseases(data.diseases);
        }
      } catch (error) {
        console.error('Failed to load diseases:', error);
      }
    };
    loadDiseases();
  }, []);

  const pollJobStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        const data = await response.json();
        if (data.success && data.status === 'completed') {
          setUploadProgress(100);
          setIsUploading(false);
          setUploadStatus('completed');
          setSuccess('Document processed successfully!');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status poll error:', error);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setError("");
      setSuccess("");
      setResult(null);
      
      setUploadedFile(file);
      setIsUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          setJobId(data.job_id);
          setSuccess('File uploaded successfully! Processing document...');
          pollJobStatus(data.job_id);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus('error');
        setError('Failed to upload document.');
        setIsUploading(false);
      }
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadStatus('');
    setJobId(null);
    setResult(null);
    setError('');
    setSuccess('');
  };

  const handleClaimSubmit = async (formData) => {
    if (!uploadedFile || uploadStatus !== 'completed') {
      setError('Please upload and process a policy document first');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuccess('');

    try {
      const formattedData = {
        patient: {
          age: formData.age,
          pre_existing_conditions: formData.pre_existing_conditions,
          enrollment_date: formData.enrollment_date?.toISOString().split('T')[0],
          application_date: formData.application_date?.toISOString().split('T')[0],
        },
        disease: formData.disease,
      };

      const response = await fetch(`${API_BASE_URL}/evaluate-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setSuccess('Claim evaluation complete!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError('Failed to evaluate claim. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, p: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 4 }}>
            Claim Acceptance Evaluation
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Upload Policy Document
                </Typography>

                <input
                  type="file"
                  accept=".pdf"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={isUploading || isAnalyzing}
                />
                <label htmlFor="file-upload">
                  <UploadArea isdragactive={isDragging}>
                    <UploadFileIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {uploadedFile ? uploadedFile.name : 'Click or drag to upload PDF'}
                    </Typography>
                    {isUploading && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="caption">Processing: {uploadProgress}%</Typography>
                      </Box>
                    )}
                  </UploadArea>
                </label>

                {uploadedFile && !isUploading && uploadStatus === 'completed' && (
                  <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 2 }}>
                    Document processed successfully!
                  </Alert>
                )}
              </Paper>

              <ClaimForm
                diseases={diseases}
                onSubmit={handleClaimSubmit}
                isAnalyzing={isAnalyzing}
                uploadedFile={uploadedFile}
                uploadStatus={uploadStatus}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <DecisionCard result={result} onReset={handleReset} />
                      </Grid>
                      <Grid item xs={12}>
                        <EnhancedResultsTabs 
                          constraints={result.constraints} 
                          alignments={result.alignment?.alignments}
                          patient={result.patient}
                        />
                      </Grid>
                    </Grid>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Box sx={{ 
                      height: 500, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      bgcolor: 'white',
                      borderRadius: '24px',
                      p: 4,
                    }}>
                      <LightbulbIcon sx={{ fontSize: 64, color: alpha(COLORS.primary, 0.3), mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Ready to Evaluate
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Upload a policy document and fill out the patient form to begin
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {isAnalyzing && <LoadingOverlay message="Evaluating claim..." />}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(''); }} />
    </Box>
  );
};

export default ClaimAcceptance;