import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Tab,
  Tabs,
  Breadcrumbs,
  Link,
  Tooltip,
  Fade,
  InputAdornment,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import PageviewIcon from "@mui/icons-material/Pageview";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import HistoryIcon from "@mui/icons-material/History";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

/* =====================================================
   🎨 TEAL TRUST COLORS
===================================================== */

const COLORS = {
  primary: "#00695C",
  secondary: "#4DB6AC",
  accent: "#FF6F61",
  background: "#F5F5F5",
  textDark: "#263238",
  textLight: "#FFFFFF",
  success: "#2E7D32",
  warning: "#ED6C02",
  info: "#0288D1",
  gradient: "linear-gradient(135deg, #00695C 0%, #4DB6AC 50%, #FF6F61 100%)",
};

/* =====================================================
   ✨ STYLED COMPONENTS
===================================================== */

const DashboardContainer = styled(Box)({
  minHeight: "100vh",
  background: COLORS.background,
  display: "flex",
});

const Sidebar = styled(Paper)({
  width: "280px",
  background: "white",
  borderRadius: "0",
  borderRight: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  padding: "24px 16px",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  height: "100vh",
  zIndex: 10,
});

const MainContent = styled(Box)({
  flex: 1,
  marginLeft: "280px",
  padding: "32px",
});

const UploadArea = styled(Paper)(({ isdragactive }) => ({
  padding: "40px",
  borderRadius: "24px",
  background: "white",
  border: `2px dashed ${isdragactive ? COLORS.primary : alpha(COLORS.primary, 0.3)}`,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: COLORS.primary,
    background: alpha(COLORS.primary, 0.02),
    transform: "translateY(-4px)",
  },
}));

const ClauseCard = styled(Card)({
  borderRadius: "16px",
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateX(4px)",
    boxShadow: `0 8px 24px ${alpha(COLORS.primary, 0.12)}`,
  },
});

const StyledChip = styled(Chip)(({ color }) => ({
  background: alpha(color, 0.1),
  color: color,
  fontWeight: 600,
  fontSize: "0.75rem",
}));

const GradientButton = styled(Button)({
  background: COLORS.gradient,
  color: "white",
  borderRadius: "40px",
  padding: "12px 32px",
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
  boxShadow: `0 8px 16px ${alpha(COLORS.primary, 0.2)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 24px ${alpha(COLORS.primary, 0.3)}`,
  },
  "&:disabled": {
    background: alpha(COLORS.primary, 0.3),
  },
});

/* =====================================================
   📋 DISEASE OPTIONS (Eligible for Insurance Claims)
===================================================== */

const DISEASE_OPTIONS = [
  { value: "diabetes_type_2", label: "Diabetes Type 2", category: "Endocrine" },
  { value: "hypertension", label: "Hypertension", category: "Cardiovascular" },
  { value: "coronary_artery_disease", label: "Coronary Artery Disease", category: "Cardiovascular" },
  { value: "copd", label: "COPD", category: "Respiratory" },
  { value: "asthma", label: "Asthma", category: "Respiratory" },
  { value: "arthritis_rheumatoid", label: "Rheumatoid Arthritis", category: "Autoimmune" },
  { value: "osteoarthritis", label: "Osteoarthritis", category: "Musculoskeletal" },
  { value: "chronic_kidney_disease", label: "Chronic Kidney Disease", category: "Renal" },
  { value: "breast_cancer", label: "Breast Cancer", category: "Oncology" },
  { value: "lung_cancer", label: "Lung Cancer", category: "Oncology" },
  { value: "prostate_cancer", label: "Prostate Cancer", category: "Oncology" },
  { value: "alzheimers", label: "Alzheimer's Disease", category: "Neurological" },
  { value: "parkinsons", label: "Parkinson's Disease", category: "Neurological" },
  { value: "multiple_sclerosis", label: "Multiple Sclerosis", category: "Neurological" },
  { value: "depression_major", label: "Major Depression", category: "Mental Health" },
  { value: "anxiety_disorder", label: "Anxiety Disorder", category: "Mental Health" },
  { value: "bipolar_disorder", label: "Bipolar Disorder", category: "Mental Health" },
  { value: "crohns_disease", label: "Crohn's Disease", category: "Gastrointestinal" },
  { value: "ulcerative_colitis", label: "Ulcerative Colitis", category: "Gastrointestinal" },
  { value: "hepatitis_c", label: "Hepatitis C", category: "Infectious" },
  { value: "hiv_aids", label: "HIV/AIDS", category: "Infectious" },
  { value: "thyroid_disorders", label: "Thyroid Disorders", category: "Endocrine" },
  { value: "sleep_apnea", label: "Sleep Apnea", category: "Respiratory" },
  { value: "migraine_chronic", label: "Chronic Migraine", category: "Neurological" },
];

/* =====================================================
   📊 DASHBOARD COMPONENT WITH REAL API INTEGRATION
===================================================== */

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  // State for file upload and analysis
  const [selectedDisease, setSelectedDisease] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [clauses, setClauses] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // API integration states
  const [jobId, setJobId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [diseases, setDiseases] = useState(DISEASE_OPTIONS);
  
  // New states for enhanced features
  const [searchQuery, setSearchQuery] = useState('');
  const [queriesUsed, setQueriesUsed] = useState([]);
  const [diseaseInfo, setDiseaseInfo] = useState(null);

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api/analysis';

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Load diseases from API on component mount
  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/diseases`);
        const data = await response.json();
        if (data.success) {
          console.log('Loaded diseases from API:', data.diseases);
          setDiseases(data.diseases);
        }
      } catch (error) {
        console.error('Failed to load diseases from API, using local list:', error);
        // Keep using local DISEASE_OPTIONS
      }
    };
    
    loadDiseases();
  }, []);

  // Poll job status
  const pollJobStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        const data = await response.json();

        if (data.success) {
          if (data.status === 'completed') {
            setUploadProgress(100);
            setIsUploading(false);
            setUploadStatus('completed');
            setSuccess('Document processed successfully! You can now extract clauses.');
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setUploadStatus('failed');
            setError(data.error || 'Processing failed');
            setIsUploading(false);
            clearInterval(interval);
          } else {
            setUploadProgress(data.progress || 0);
          }
        }
      } catch (error) {
        console.error('Status poll error:', error);
        setError('Lost connection to server. Please check your connection.');
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload({ target: { files: [files[0]] } });
    }
  };

  // Real file upload function
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      // Reset states
      setError("");
      setSuccess("");
      setAnalysisComplete(false);
      setClauses([]);
      setQueriesUsed([]);
      
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
          // Poll for job status
          pollJobStatus(data.job_id);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus('error');
        setError('Failed to upload document. Please make sure the backend server is running at http://localhost:5000');
        setIsUploading(false);
        setUploadedFile(null);
      }
    } else {
      setError("Please upload a PDF file");
    }
  };

  // Real clause extraction with enhanced disease-specific queries
  const handleSubmit = async () => {
    if (!selectedDisease || !uploadedFile) {
      setError("Please select a disease and upload a policy document");
      return;
    }

    if (uploadStatus !== 'completed') {
      setError("Please wait for document processing to complete");
      return;
    }

    setIsAnalyzing(true);
    setApiLoading(true);
    setError("");
    setSuccess("");
    setClauses([]);
    setQueriesUsed([]);

    try {
      const diseaseObj = diseases.find(d => d.value === selectedDisease);
      const diseaseName = diseaseObj ? diseaseObj.label : selectedDisease;
      setDiseaseInfo(diseaseObj);
      
      setSearchQuery(`🔍 Searching for clauses related to: "${diseaseName}"`);
      
      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disease: selectedDisease,
          n_results: 20,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Format the clauses to match component expectations
        const formattedClauses = data.clauses.map((clause, index) => ({
          ...clause,
          id: clause.id || `clause_${index + 1}`,
          page_number: clause.page || clause.page_number || 1,
          relevance: clause.similarity_score || clause.relevance || 0.85,
          text: clause.text || "No text available",
          category: clause.category || "General"
        }));
        
        setClauses(formattedClauses);
        setQueriesUsed(data.queries_used || []);
        setAnalysisComplete(true);
        setSuccess(`Found ${formattedClauses.length} relevant clauses for "${diseaseName}"`);
      } else {
        throw new Error(data.error || 'Extraction failed');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setError('Failed to extract clauses. Please make sure the backend server is running.');
    } finally {
      setIsAnalyzing(false);
      setApiLoading(false);
    }
  };

  // Reset analysis
  const handleReset = () => {
    setSelectedDisease("");
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setAnalysisComplete(false);
    setClauses([]);
    setQueriesUsed([]);
    setError("");
    setSuccess("");
    setUploadStatus('');
    setJobId(null);
    setSearchQuery('');
    setDiseaseInfo(null);
  };

  // Filter clauses based on search and active tab
  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 0) return matchesSearch;
    if (activeTab === 1) return matchesSearch && (clause.category === "Coverage" || clause.category === "Benefits");
    if (activeTab === 2) return matchesSearch && clause.category === "Exclusion";
    if (activeTab === 3) return matchesSearch && clause.category === "Waiting Period";
    if (activeTab === 4) return matchesSearch && clause.category === "Pre-existing Condition";
    if (activeTab === 5) return matchesSearch && clause.category === "Ambiguity";
    return matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case "coverage":
      case "benefits":
        return <VerifiedIcon sx={{ color: COLORS.success }} />;
      case "exclusion":
        return <WarningIcon sx={{ color: COLORS.warning }} />;
      case "waiting period":
        return <HistoryIcon sx={{ color: COLORS.info }} />;
      case "pre-existing condition":
        return <ErrorIcon sx={{ color: COLORS.accent }} />;
      case "ambiguity":
        return <HelpOutlineIcon sx={{ color: COLORS.info }} />;
      default:
        return <ArticleIcon sx={{ color: COLORS.primary }} />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case "coverage":
      case "benefits":
        return COLORS.success;
      case "exclusion":
        return COLORS.warning;
      case "waiting period":
        return COLORS.info;
      case "pre-existing condition":
        return COLORS.accent;
      case "ambiguity":
        return COLORS.info;
      default:
        return COLORS.primary;
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Paper sx={{ p: 4, borderRadius: "24px", textAlign: "center" }}>
          <LinearProgress sx={{ width: 300, borderRadius: 2, mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Loading your dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <Sidebar elevation={0}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
          <PsychologyIcon sx={{ color: COLORS.primary, fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textDark }}>
            NeuroSure
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ flex: 1 }}>
          {[
            { icon: <DashboardIcon />, label: "Dashboard", active: true },
            { icon: <HistoryIcon />, label: "Analysis History" },
            { icon: <FolderIcon />, label: "Medical Vault" },
            { icon: <SettingsIcon />, label: "Settings" },
          ].map((item, i) => (
            <Button
              key={i}
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.5,
                borderRadius: "12px",
                color: item.active ? COLORS.primary : alpha(COLORS.textDark, 0.7),
                bgcolor: item.active ? alpha(COLORS.primary, 0.08) : "transparent",
                "&:hover": {
                  bgcolor: alpha(COLORS.primary, 0.05),
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(COLORS.primary, 0.1)}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: COLORS.primary, color: "white" }}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, truncate: true }}>
                {user?.displayName || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6), display: "block", truncate: true }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: alpha(COLORS.textDark, 0.7),
              "&:hover": { color: COLORS.accent },
            }}
          >
            Logout
          </Button>
        </Box>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}>
                Policy Analysis Dashboard
              </Typography>
              <Breadcrumbs>
                <Link color="inherit" href="#" onClick={() => navigate("/")}>Home</Link>
                <Link color="inherit" href="#" onClick={() => navigate("/dashboard")}>Dashboard</Link>
                <Typography color="textPrimary">Analysis</Typography>
              </Breadcrumbs>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton 
                  sx={{ bgcolor: "white", boxShadow: 2 }}
                  onClick={() => window.location.reload()}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="View History">
                <IconButton sx={{ bgcolor: "white", boxShadow: 2 }}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: "12px" }}
              onClose={() => setError("")}
              action={
                <IconButton color="inherit" size="small" onClick={() => setError("")}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: "12px" }}
              onClose={() => setSuccess("")}
              icon={<CheckCircleIcon fontSize="inherit" />}
            >
              {success}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Left Column - Upload & Disease Selection */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "white", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Upload Policy Document
                  </Typography>

                  <input
                    type="file"
                    accept=".pdf"
                    id="file-upload"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    disabled={isUploading || isAnalyzing}
                  />
                  <label htmlFor="file-upload">
                    <UploadArea 
                      isdragactive={isDragging}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      sx={{ 
                        opacity: isUploading || isAnalyzing ? 0.6 : 1,
                        pointerEvents: isUploading || isAnalyzing ? "none" : "auto"
                      }}
                    >
                      <UploadFileIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {uploadedFile ? uploadedFile.name : "Click or drag to upload PDF"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                        {uploadedFile 
                          ? `Size: ${(uploadedFile.size / 1024).toFixed(2)} KB`
                          : "Maximum file size: 50MB"
                        }
                      </Typography>
                      {isUploading && (
                        <Box sx={{ mt: 2, width: "100%" }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ borderRadius: 2, height: 8 }}
                          />
                          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                            Processing: {uploadProgress}%
                          </Typography>
                        </Box>
                      )}
                    </UploadArea>
                  </label>

                  {uploadedFile && !isUploading && uploadStatus === 'completed' && (
                    <Fade in={true}>
                      <Alert 
                        icon={<CheckCircleIcon fontSize="inherit" />}
                        severity="success" 
                        sx={{ mt: 2, borderRadius: "12px" }}
                      >
                        Document processed successfully! Ready for analysis.
                      </Alert>
                    </Fade>
                  )}

                  {uploadedFile && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={handleReset}
                        startIcon={<CloseIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Paper>

                <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Select Condition
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Disease / Condition</InputLabel>
                    <Select
                      value={selectedDisease}
                      onChange={(e) => setSelectedDisease(e.target.value)}
                      label="Disease / Condition"
                      sx={{ borderRadius: "14px" }}
                      disabled={isAnalyzing}
                    >
                      {diseases.map((disease) => (
                        <MenuItem key={disease.value} value={disease.value}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                            <span>{disease.label}</span>
                            <Chip 
                              label={disease.category} 
                              size="small" 
                              sx={{ ml: 2, bgcolor: alpha(COLORS.primary, 0.1), fontSize: "0.7rem" }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <GradientButton
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!selectedDisease || !uploadedFile || isAnalyzing || uploadStatus !== 'completed'}
                    endIcon={isAnalyzing ? null : <SearchIcon />}
                  >
                    {isAnalyzing ? "Analyzing..." : "Extract Relevant Clauses"}
                  </GradientButton>

                  {isAnalyzing && (
                    <Box sx={{ mt: 3 }}>
                      <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
                      <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center", color: alpha(COLORS.textDark, 0.7) }}>
                        Running semantic search with multiple disease-specific queries...
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>

            {/* Right Column - Results */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "white", minHeight: 600 }}>
                  {!analysisComplete ? (
                    <Box sx={{ 
                      height: 500, 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "center", 
                      alignItems: "center",
                      color: alpha(COLORS.textDark, 0.5)
                    }}>
                      <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>
                        {selectedDisease && uploadedFile && uploadStatus === 'completed'
                          ? "Ready to analyze"
                          : "No analysis results yet"
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 400 }}>
                        {selectedDisease && uploadedFile && uploadStatus === 'completed'
                          ? "Click 'Extract Relevant Clauses' to begin semantic search with disease-specific queries"
                          : "Select a disease and upload a policy document to see semantically relevant clauses"
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Relevant Clauses Found 
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {filteredClauses.length} of {clauses.length} clauses match your criteria
                          </Typography>
                        </Box>
                        <TextField
                          size="small"
                          placeholder="Search clauses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          sx={{ width: 250 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      {/* Search Query Display */}
                      {searchQuery && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: alpha(COLORS.primary, 0.05), borderRadius: "12px" }}>
                          <Typography variant="body2" color="textSecondary">
                            {searchQuery}
                          </Typography>
                        </Box>
                      )}

                      {/* Queries Used Accordion */}
                      {queriesUsed.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Accordion 
                            sx={{ 
                              bgcolor: alpha(COLORS.primary, 0.02),
                              borderRadius: "12px !important",
                              border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                              '&:before': { display: 'none' }
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ minHeight: 48 }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.primary }}>
                                🔍 Multiple search queries used for better semantic matching
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {queriesUsed.map((query, index) => (
                                  <Chip
                                    key={index}
                                    label={query}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(COLORS.primary, 0.1),
                                      color: COLORS.textDark,
                                      fontSize: "0.75rem",
                                      '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) }
                                    }}
                                  />
                                ))}
                              </Box>
                              <Typography variant="caption" sx={{ mt: 2, display: "block", color: alpha(COLORS.textDark, 0.5) }}>
                                Multiple query variations improve semantic search accuracy for disease-specific clauses
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      )}

                      <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)}
                        sx={{ mb: 3, borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}` }}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        <Tab label={`All (${clauses.length})`} />
                        <Tab label={`Coverage (${clauses.filter(c => c.category === "Coverage" || c.category === "Benefits").length})`} />
                        <Tab label={`Exclusions (${clauses.filter(c => c.category === "Exclusion").length})`} />
                        <Tab label={`Waiting Period (${clauses.filter(c => c.category === "Waiting Period").length})`} />
                        <Tab label={`Pre-existing (${clauses.filter(c => c.category === "Pre-existing Condition").length})`} />
                        <Tab label={`Ambiguities (${clauses.filter(c => c.category === "Ambiguity").length})`} />
                      </Tabs>

                      <List sx={{ maxHeight: 500, overflow: "auto", pr: 1 }}>
                        <AnimatePresence>
                          {filteredClauses.length > 0 ? (
                            filteredClauses.map((clause, index) => (
                              <motion.div
                                key={clause.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <ClauseCard sx={{ mb: 2 }}>
                                  <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {getCategoryIcon(clause.category)}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: getCategoryColor(clause.category) }}>
                                          {clause.category}
                                          {clause.disease_mentioned && (
                                            <Chip
                                              label="Disease mentioned"
                                              size="small"
                                              sx={{ ml: 1, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, height: 20, fontSize: '0.6rem' }}
                                            />
                                          )}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {clause.cds && (
                                          <Tooltip title="Coverage Density Score - Higher is better">
                                            <StyledChip 
                                              label={`CDS: ${clause.cds}%`}
                                              color={COLORS.success}
                                              size="small"
                                            />
                                          </Tooltip>
                                        )}
                                        {clause.erg && (
                                          <Tooltip title="Exclusion Risk Gradient - Lower is better">
                                            <StyledChip 
                                              label={`ERG: ${clause.erg}%`}
                                              color={COLORS.warning}
                                              size="small"
                                            />
                                          </Tooltip>
                                        )}
                                        {clause.pai && (
                                          <Tooltip title="Policy Ambiguity Index - Lower is clearer">
                                            <StyledChip 
                                              label={`PAI: ${clause.pai}`}
                                              color={COLORS.info}
                                              size="small"
                                            />
                                          </Tooltip>
                                        )}
                                      </Box>
                                    </Box>

                                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7, color: COLORS.textDark }}>
                                      {clause.text}
                                    </Typography>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                      <Chip
                                        icon={<PageviewIcon />}
                                        label={`Page ${clause.page_number || clause.page || 1}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: alpha(COLORS.primary, 0.3) }}
                                      />
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Tooltip title="Semantic Relevance Score">
                                          <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                                            Relevance: {Math.round((clause.similarity_score || clause.relevance || 0.85) * 100)}%
                                          </Typography>
                                        </Tooltip>
                                        <Tooltip title="Share">
                                          <IconButton size="small">
                                            <ShareIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download">
                                          <IconButton size="small">
                                            <DownloadIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </ClauseCard>
                              </motion.div>
                            ))
                          ) : (
                            <Box sx={{ textAlign: "center", py: 8 }}>
                              <Typography variant="body1" color="textSecondary">
                                No clauses match your search criteria
                              </Typography>
                            </Box>
                          )}
                        </AnimatePresence>
                      </List>
                    </>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </MainContent>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Operation completed"
      />
    </DashboardContainer>
  );
};

export default Dashboard;