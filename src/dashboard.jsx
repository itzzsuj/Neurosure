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
  CircularProgress,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  List,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Tooltip,
  Fade,
  InputAdornment,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
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
import PsychologyIcon from "@mui/icons-material/Psychology";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import GavelIcon from "@mui/icons-material/Gavel";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

/* =====================================================
   🎨 COLOR PALETTE
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
  purple: "#7B1FA2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  grey: "#9E9E9E",
  gradient: "linear-gradient(135deg, #00695C 0%, #4DB6AC 50%, #FF6F61 100%)",
};

/* =====================================================
   📋 DISEASE OPTIONS
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
  boxShadow: "4px 0 20px rgba(0,0,0,0.05)",
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
    boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.1)}`,
  },
}));

const ClauseCard = styled(Card)({
  borderRadius: "20px",
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  transition: "all 0.3s ease",
  background: "white",
  "&:hover": {
    transform: "translateX(4px) scale(1.02)",
    boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.15)}`,
    borderColor: alpha(COLORS.primary, 0.3),
  },
});

const StyledChip = styled(Chip)(({ color }) => ({
  background: alpha(color, 0.1),
  color: color,
  fontWeight: 600,
  fontSize: "0.75rem",
  border: `1px solid ${alpha(color, 0.2)}`,
  "&:hover": {
    background: alpha(color, 0.2),
  },
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

const MetricCard = styled(Paper)(({ color, gradient }) => ({
  padding: "24px",
  borderRadius: "24px",
  background: gradient || `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  textAlign: "center",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: color,
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: `0 30px 60px ${alpha(color, 0.3)}`,
  },
}));

const ScoreRing = styled(Box)(({ score, color }) => ({
  position: "relative",
  display: "inline-flex",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: `conic-gradient(${color} ${score * 360}deg, ${alpha(color, 0.1)} 0deg)`,
  margin: "0 auto 16px",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "10px",
    left: "10px",
    right: "10px",
    bottom: "10px",
    borderRadius: "50%",
    background: "white",
  },
  "&::after": {
    content: `"${Math.round(score * 100)}%"`,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "24px",
    fontWeight: "bold",
    color: color,
  },
}));

const DetailedMetricCard = styled(Card)({
  borderRadius: "24px",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.15)}`,
  },
});

const ProgressWithLabel = ({ value, color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
    <Typography variant="body2" sx={{ minWidth: 100, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Box sx={{ flex: 1, position: "relative" }}>
      <LinearProgress
        variant="determinate"
        value={value * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(color, 0.1),
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
    <Typography variant="body2" sx={{ minWidth: 50, fontWeight: 600, color }}>
      {Math.round(value * 100)}%
    </Typography>
  </Box>
);

const CategoryDistribution = ({ coverage, exclusion, waiting, general }) => {
  const total = coverage + exclusion + waiting + general;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
      {[
        { label: "Coverage", value: coverage, color: COLORS.success },
        { label: "Exclusion", value: exclusion, color: COLORS.warning },
        { label: "Waiting", value: waiting, color: COLORS.info },
        { label: "General", value: general, color: COLORS.primary },
      ].map((item) => (
        <Tooltip key={item.label} title={`${item.label}: ${item.value} clauses`}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: `conic-gradient(${item.color} ${(item.value / total) * 360}deg, ${alpha(item.color, 0.1)} 0deg)`,
                mb: 1,
                border: `2px solid ${item.color}`,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, color: item.color }}>
              {item.label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

// Clause analysis table with weak row highlighting - ALL SCORES FROM BACKEND ONLY
const ClauseAnalysisTable = ({ clauses }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: "16px", mt: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.05) }}>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Relevance</TableCell>
            <TableCell align="right">CDS</TableCell>
            <TableCell align="right">ERG</TableCell>
            <TableCell align="right">PAI</TableCell>
            <TableCell>Mention</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clauses.map((clause, index) => {
            const isWeak = clause.relevance < 0.3;
            return (
              <TableRow 
                key={index} 
                sx={{ 
                  "&:hover": { bgcolor: alpha(COLORS.primary, 0.02) },
                  opacity: isWeak ? 0.6 : 1,
                  bgcolor: isWeak ? alpha(COLORS.grey, 0.05) : 'inherit',
                  ...(isWeak && {
                    '& td': {
                      color: alpha(COLORS.textDark, 0.7),
                    }
                  })
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Chip
                    label={clause.category}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        clause.category === "Coverage" ? COLORS.success :
                        clause.category === "Exclusion" ? COLORS.warning :
                        clause.category === "Waiting Period" ? COLORS.info :
                        COLORS.primary, 0.1
                      ),
                      color: clause.category === "Coverage" ? COLORS.success :
                             clause.category === "Exclusion" ? COLORS.warning :
                             clause.category === "Waiting Period" ? COLORS.info :
                             COLORS.primary,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 600 }}>
                    {Math.round(clause.relevance * 100)}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ color: COLORS.success, fontWeight: 600 }}>
                    {Math.round(clause.cds)}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ color: COLORS.warning, fontWeight: 600 }}>
                    {Math.round(clause.erg)}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ color: COLORS.info, fontWeight: 600 }}>
                    {clause.pai.toFixed(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {clause.disease_mentioned ? (
                    <Chip
                      label="✓"
                      size="small"
                      sx={{ bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}
                    />
                  ) : (
                    <Chip
                      label="✗"
                      size="small"
                      sx={{ bgcolor: alpha(COLORS.grey, 0.1), color: COLORS.grey }}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Box sx={{ p: 1, bgcolor: alpha(COLORS.grey, 0.1), textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: COLORS.textDark }}>
          ⚠️ Rows with lower opacity indicate weak matches (relevance {'<'} 30%) - not included in final CDS/ERG/PAI calculations.
        </Typography>
      </Box>
    </TableContainer>
  );
};

// Top Clause Card
const TopClauseCard = ({ clause, rank }) => {
  const getRankIcon = () => {
    switch(rank) {
      case 1: return <EmojiEventsIcon sx={{ color: COLORS.gold, fontSize: 40 }} />;
      case 2: return <MilitaryTechIcon sx={{ color: COLORS.silver, fontSize: 35 }} />;
      case 3: return <WorkspacePremiumIcon sx={{ color: COLORS.bronze, fontSize: 30 }} />;
      default: return <StarIcon sx={{ color: COLORS.primary }} />;
    }
  };

  return (
    <Card sx={{
      borderRadius: "20px",
      background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.05)} 0%, white 100%)`,
      border: `2px solid ${rank === 1 ? COLORS.gold : rank === 2 ? COLORS.silver : rank === 3 ? COLORS.bronze : alpha(COLORS.primary, 0.2)}`,
      mb: 2,
    }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {getRankIcon()}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              #{rank} Most Relevant Clause
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Relevance Score: {Math.round(clause.relevance * 100)}%
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: alpha(COLORS.primary, 0.02), borderRadius: "12px" }}>
          {clause.text.length > 200 ? clause.text.substring(0, 200) + "..." : clause.text}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`CDS: ${Math.round(clause.cds)}%`}
            size="small"
            sx={{ bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}
          />
          <Chip
            label={`ERG: ${Math.round(clause.erg)}%`}
            size="small"
            sx={{ bgcolor: alpha(COLORS.warning, 0.1), color: COLORS.warning }}
          />
          <Chip
            label={`PAI: ${clause.pai.toFixed(1)}`}
            size="small"
            sx={{ bgcolor: alpha(COLORS.info, 0.1), color: COLORS.info }}
          />
          {clause.disease_mentioned && (
            <Chip
              label="Disease Mentioned"
              size="small"
              sx={{ bgcolor: alpha(COLORS.purple, 0.1), color: COLORS.purple }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Detail Dialog Component
const DetailDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: '#1E1E1E',
    color: '#FFFFFF',
    maxWidth: '800px',
    width: '100%',
  },
}));

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
});

// =====================================================
// MAIN DASHBOARD COMPONENT
// =====================================================

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
  
  // Enhanced features states
  const [searchQuery, setSearchQuery] = useState('');
  const [queriesUsed, setQueriesUsed] = useState([]);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  
  // Aggregate scores - ALL FROM BACKEND LAYERS
  const [cdsScore, setCdsScore] = useState(null);
  const [ergScore, setErgScore] = useState(null);
  const [paiScore, setPaiScore] = useState(null);
  
  // Detailed report and metrics
  const [detailedReport, setDetailedReport] = useState('');
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [cdsBreakdown, setCdsBreakdown] = useState(null);

  // Dialog states for detailed views
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailContent, setDetailContent] = useState('');

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api/analysis';

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadDiseases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/diseases`);
        const data = await response.json();
        if (data.success) {
          setDiseases(data.diseases);
        }
      } catch (error) {
        console.error('Failed to load diseases from API, using local list:', error);
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

  // File upload function
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setError("");
      setSuccess("");
      setAnalysisComplete(false);
      setClauses([]);
      setQueriesUsed([]);
      setCdsScore(null);
      setErgScore(null);
      setPaiScore(null);
      setDetailedReport('');
      
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

  // Parse detailed report into structured data - ONLY FOR DISPLAY, NO CALCULATION
  const parseDetailedReport = (report, clauses) => {
    if (!report) return null;
    
    const cdsMatch = report.match(/FINAL CDS Score for [^:]+: ([\d.]+)/);
    const ergMatch = report.match(/FINAL ERG Score for [^:]+: ([\d.]+)/);
    const paiMatch = report.match(/FINAL PAI Score for [^:]+: ([\d.]+)/);
    
    const weakMatch = report.match(/Weak matches skipped[^:]+: (\d+)/);
    const totalClauses = clauses.length;
    const weakMatches = weakMatch ? parseInt(weakMatch[1]) : 0;
    
    const coverageCount = clauses.filter(c => c.category === "Coverage" || c.category === "Benefits").length;
    const exclusionCount = clauses.filter(c => c.category === "Exclusion").length;
    const waitingCount = clauses.filter(c => c.category === "Waiting Period").length;
    const generalCount = clauses.filter(c => c.category === "General").length;
    
    return {
      cds: cdsMatch ? parseFloat(cdsMatch[1]) : 0,
      erg: ergMatch ? parseFloat(ergMatch[1]) : 0,
      pai: paiMatch ? parseFloat(paiMatch[1]) : 0,
      weakMatches,
      strongMatches: totalClauses - weakMatches,
      distribution: {
        coverage: coverageCount,
        exclusion: exclusionCount,
        waiting: waitingCount,
        general: generalCount,
      }
    };
  };

  // Get specific metric details from report - ONLY FOR DISPLAY
  const getMetricDetails = (type) => {
    if (!detailedReport) return 'No detailed report available';
    
    if (type === 'cds') {
      const lines = detailedReport.split('\n');
      let cdsSection = [];
      let inCdsSection = false;
      
      for (const line of lines) {
        if (line.includes('Calculating CDS')) {
          inCdsSection = true;
        }
        if (inCdsSection) {
          cdsSection.push(line);
          if (line.includes('FINAL CDS Score')) {
            break;
          }
        }
        if (line.includes('Calculating ERG') && inCdsSection) {
          break;
        }
      }
      return cdsSection.join('\n');
    } else if (type === 'erg') {
      const lines = detailedReport.split('\n');
      let ergSection = [];
      let inErgSection = false;
      
      for (const line of lines) {
        if (line.includes('Calculating ERG')) {
          inErgSection = true;
        }
        if (inErgSection) {
          ergSection.push(line);
          if (line.includes('FINAL ERG Score')) {
            break;
          }
        }
        if (line.includes('Calculating PAI') && inErgSection) {
          break;
        }
      }
      return ergSection.join('\n');
    } else if (type === 'pai') {
      const lines = detailedReport.split('\n');
      let paiSection = [];
      let inPaiSection = false;
      
      for (const line of lines) {
        if (line.includes('Calculating PAI')) {
          inPaiSection = true;
        }
        if (inPaiSection) {
          paiSection.push(line);
          if (line.includes('FINAL PAI Score')) {
            break;
          }
        }
      }
      return paiSection.join('\n');
    }
    return '';
  };

  // Click handlers for metric cards
  const handleCdsClick = () => {
    setDetailTitle('📊 CDS - Coverage Density Score Detailed Calculation');
    setDetailContent(getMetricDetails('cds'));
    setDetailDialogOpen(true);
  };

  const handleErgClick = () => {
    setDetailTitle('📊 ERG - Exclusion Risk Gradient Detailed Calculation');
    setDetailContent(getMetricDetails('erg'));
    setDetailDialogOpen(true);
  };

  const handlePaiClick = () => {
    setDetailTitle('📊 PAI - Policy Ambiguity Index Detailed Calculation');
    setDetailContent(getMetricDetails('pai'));
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
  };

  // Clause extraction - ALL SCORES COME FROM BACKEND LAYERS
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
    setCdsScore(null);
    setErgScore(null);
    setPaiScore(null);
    setDetailedReport('');

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
        // Format clauses - ALL VALUES COME DIRECTLY FROM BACKEND
        const formattedClauses = data.clauses.map((clause, index) => ({
          ...clause,
          id: clause.id || `clause_${index + 1}`,
          page_number: clause.page || clause.page_number || 1,
          relevance: clause.similarity_score || clause.relevance || 0,
          text: clause.text || "No text available",
          category: clause.category || "General",
          cds: clause.cds || 0,        // FROM BACKEND LAYERS
          erg: clause.erg || 0,         // FROM BACKEND LAYERS
          pai: clause.pai || 0,         // FROM BACKEND LAYERS
          disease_mentioned: clause.disease_mentioned || false
        }));
        
        setClauses(formattedClauses);
        setQueriesUsed(data.queries_used || []);
        setCdsScore(data.cds_score || 0);      // FROM BACKEND LAYERS
        setErgScore(data.erg_score || 0);       // FROM BACKEND LAYERS
        setPaiScore(data.pai_score || 0);       // FROM BACKEND LAYERS
        setDetailedReport(data.detailed_report || '');
        
        const parsed = parseDetailedReport(data.detailed_report, formattedClauses);
        setCdsBreakdown(parsed);
        
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
    setCdsScore(null);
    setErgScore(null);
    setPaiScore(null);
    setDetailedReport('');
    setCdsBreakdown(null);
  };

  // Filter clauses
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

  const formatScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${Math.round(score * 100)}%`;
  };

  const getScoreColor = (score, type) => {
    if (score === null || score === undefined) return COLORS.textDark;
    
    if (type === 'cds') {
      if (score >= 0.7) return COLORS.success;
      if (score >= 0.4) return COLORS.warning;
      return COLORS.accent;
    } else if (type === 'erg') {
      if (score <= 0.3) return COLORS.success;
      if (score <= 0.6) return COLORS.warning;
      return COLORS.accent;
    } else if (type === 'pai') {
      if (score <= 0.3) return COLORS.success;
      if (score <= 0.6) return COLORS.warning;
      return COLORS.accent;
    }
    return COLORS.primary;
  };

  const getScoreIcon = (score, type) => {
    if (type === 'cds') {
      if (score >= 0.7) return <TrendingUpIcon sx={{ color: COLORS.success }} />;
      if (score >= 0.4) return <TrendingFlatIcon sx={{ color: COLORS.warning }} />;
      return <TrendingDownIcon sx={{ color: COLORS.accent }} />;
    } else {
      if (score <= 0.3) return <TrendingDownIcon sx={{ color: COLORS.success }} />;
      if (score <= 0.6) return <TrendingFlatIcon sx={{ color: COLORS.warning }} />;
      return <TrendingUpIcon sx={{ color: COLORS.accent }} />;
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const toggleDetailedReport = () => {
    setShowDetailedReport(!showDetailedReport);
  };

  // 🔥 Category weighting for top clauses - only affects display order, NOT scores
  const getCategoryWeight = (category) => {
    if (category === 'Exclusion' || category === 'Coverage') return 0.2;
    if (category === 'Waiting Period' || category === 'Pre-existing Condition') return 0.1;
    if (category === 'Ambiguity') return 0.05;
    return 0; // General and others
  };

  // Sort clauses with category weighting for top picks - DISPLAY ONLY, SCORES UNCHANGED
  const topClauses = [...clauses]
    .sort((a, b) => {
      const scoreA = a.relevance + getCategoryWeight(a.category);
      const scoreB = b.relevance + getCategoryWeight(b.category);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Paper sx={{ p: 4, borderRadius: "24px", textAlign: "center" }}>
          <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
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
                          ? "Click 'Extract Relevant Clauses' to begin semantic search"
                          : "Select a disease and upload a policy document to see semantically relevant clauses"
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary }}>
                            Analysis Results for {diseaseInfo?.label || selectedDisease}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {filteredClauses.length} of {clauses.length} clauses match your criteria
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Toggle Detailed Analysis">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AssessmentIcon />}
                              onClick={toggleDetailedReport}
                              sx={{ 
                                borderRadius: "20px",
                                background: showDetailedReport ? COLORS.primary : alpha(COLORS.primary, 0.1),
                                color: showDetailedReport ? "white" : COLORS.primary,
                                '&:hover': {
                                  background: showDetailedReport ? COLORS.secondary : alpha(COLORS.primary, 0.2),
                                }
                              }}
                            >
                              {showDetailedReport ? "Hide Analysis" : "View Detailed Analysis"}
                            </Button>
                          </Tooltip>
                          <TextField
                            size="small"
                            placeholder="Search clauses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: 200 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Metric Cards - ALL VALUES FROM BACKEND LAYERS */}
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* CDS Card */}
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Box onClick={handleCdsClick} sx={{ cursor: 'pointer' }}>
                              <MetricCard 
                                color={getScoreColor(cdsScore, 'cds')}
                                gradient={`linear-gradient(135deg, ${alpha(COLORS.success, 0.1)} 0%, white 100%)`}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                  <VerifiedIcon sx={{ color: COLORS.success, fontSize: 40 }} />
                                  {getScoreIcon(cdsScore, 'cds')}
                                </Box>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.success, lineHeight: 1 }}>
                                  {formatScore(cdsScore)}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                                  Coverage Density
                                </Typography>
                                <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                                  Click for detailed calculation
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  <ProgressWithLabel 
                                    value={cdsScore || 0} 
                                    color={COLORS.success}
                                    label="Coverage Strength"
                                  />
                                </Box>
                              </MetricCard>
                            </Box>
                          </motion.div>
                        </Grid>

                        {/* ERG Card */}
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Box onClick={handleErgClick} sx={{ cursor: 'pointer' }}>
                              <MetricCard 
                                color={getScoreColor(ergScore, 'erg')}
                                gradient={`linear-gradient(135deg, ${alpha(COLORS.warning, 0.1)} 0%, white 100%)`}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                  <WarningIcon sx={{ color: COLORS.warning, fontSize: 40 }} />
                                  {getScoreIcon(ergScore, 'erg')}
                                </Box>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.warning, lineHeight: 1 }}>
                                  {formatScore(ergScore)}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                                  Exclusion Risk
                                </Typography>
                                <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                                  Click for detailed calculation
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  <ProgressWithLabel 
                                    value={ergScore || 0} 
                                    color={COLORS.warning}
                                    label="Risk Level"
                                  />
                                </Box>
                              </MetricCard>
                            </Box>
                          </motion.div>
                        </Grid>

                        {/* PAI Card */}
                        <Grid item xs={12} md={4}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Box onClick={handlePaiClick} sx={{ cursor: 'pointer' }}>
                              <MetricCard 
                                color={getScoreColor(paiScore, 'pai')}
                                gradient={`linear-gradient(135deg, ${alpha(COLORS.info, 0.1)} 0%, white 100%)`}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                  <GavelIcon sx={{ color: COLORS.info, fontSize: 40 }} />
                                  {getScoreIcon(paiScore, 'pai')}
                                </Box>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.info, lineHeight: 1 }}>
                                  {formatScore(paiScore)}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                                  Policy Ambiguity
                                </Typography>
                                <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                                  Click for detailed calculation
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                  <ProgressWithLabel 
                                    value={paiScore || 0} 
                                    color={COLORS.info}
                                    label="Ambiguity Level"
                                  />
                                </Box>
                              </MetricCard>
                            </Box>
                          </motion.div>
                        </Grid>
                      </Grid>

                      {/* Top 3 Clauses Section - Category Weighted for Display */}
                      {topClauses.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <EmojiEventsIcon sx={{ color: COLORS.gold }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Top 3 Most Relevant Clauses
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {topClauses.map((clause, index) => (
                              <Grid item xs={12} key={index}>
                                <TopClauseCard clause={clause} rank={index + 1} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Detailed Analysis Section */}
                      {showDetailedReport && (
                        <Box sx={{ mb: 4 }}>
                          <Accordion 
                            defaultExpanded
                            sx={{ 
                              borderRadius: "24px !important",
                              overflow: "hidden",
                              border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                              '&:before': { display: 'none' }
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ 
                                bgcolor: alpha(COLORS.primary, 0.02),
                                borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <AutoGraphIcon sx={{ color: COLORS.primary }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  Comprehensive Metrics Analysis
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 3 }}>
                              <Grid container spacing={3}>
                                {/* CDS Breakdown */}
                                <Grid item xs={12} md={4}>
                                  <DetailedMetricCard>
                                    <CardContent>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <VerifiedIcon sx={{ color: COLORS.success }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                          CDS Breakdown
                                        </Typography>
                                      </Box>
                                      <ScoreRing score={cdsScore || 0} color={COLORS.success} />
                                      <Typography variant="body2" sx={{ mb: 2 }}>
                                        Coverage Density Score measures how comprehensively the policy covers the condition.
                                      </Typography>
                                      <Divider sx={{ my: 2 }} />
                                      <Typography variant="subtitle2" gutterBottom>
                                        Calculation Details:
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        • Strong clauses: {cdsBreakdown?.strongMatches || 0}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        • Weak matches skipped: {cdsBreakdown?.weakMatches || 0}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        • Coverage ratio: {Math.round((cdsScore || 0) * 100)}%
                                      </Typography>
                                    </CardContent>
                                  </DetailedMetricCard>
                                </Grid>

                                {/* ERG Breakdown */}
                                <Grid item xs={12} md={4}>
                                  <DetailedMetricCard>
                                    <CardContent>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <WarningIcon sx={{ color: COLORS.warning }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                          ERG Breakdown
                                        </Typography>
                                      </Box>
                                      <ScoreRing score={ergScore || 0} color={COLORS.warning} />
                                      <Typography variant="body2" sx={{ mb: 2 }}>
                                        Exclusion Risk Gradient indicates likelihood of claim rejection.
                                      </Typography>
                                      <Divider sx={{ my: 2 }} />
                                      <Typography variant="subtitle2" gutterBottom>
                                        Risk Contributors:
                                      </Typography>
                                      <ProgressWithLabel 
                                        value={cdsBreakdown?.distribution?.exclusion / Math.max(1, clauses.length)} 
                                        color={COLORS.warning}
                                        label="Exclusions"
                                      />
                                      <ProgressWithLabel 
                                        value={cdsBreakdown?.distribution?.waiting / Math.max(1, clauses.length)} 
                                        color={COLORS.info}
                                        label="Waiting Periods"
                                      />
                                    </CardContent>
                                  </DetailedMetricCard>
                                </Grid>

                                {/* PAI Breakdown */}
                                <Grid item xs={12} md={4}>
                                  <DetailedMetricCard>
                                    <CardContent>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                        <GavelIcon sx={{ color: COLORS.info }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                          PAI Breakdown
                                        </Typography>
                                      </Box>
                                      <ScoreRing score={paiScore || 0} color={COLORS.info} />
                                      <Typography variant="body2" sx={{ mb: 2 }}>
                                        Policy Ambiguity Index measures vagueness in policy language.
                                      </Typography>
                                      <Divider sx={{ my: 2 }} />
                                      <Typography variant="subtitle2" gutterBottom>
                                        Category Distribution:
                                      </Typography>
                                      <CategoryDistribution 
                                        coverage={cdsBreakdown?.distribution?.coverage || 0}
                                        exclusion={cdsBreakdown?.distribution?.exclusion || 0}
                                        waiting={cdsBreakdown?.distribution?.waiting || 0}
                                        general={cdsBreakdown?.distribution?.general || 0}
                                      />
                                    </CardContent>
                                  </DetailedMetricCard>
                                </Grid>

                                {/* Clause Analysis Table */}
                                <Grid item xs={12}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                    Detailed Clause Analysis
                                  </Typography>
                                  <ClauseAnalysisTable clauses={clauses} />
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      )}

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
                                        <Tooltip title="Coverage Density Score - Higher is better">
                                          <StyledChip 
                                            label={`CDS: ${Math.round(clause.cds)}%`}
                                            color={COLORS.success}
                                            size="small"
                                          />
                                        </Tooltip>
                                        <Tooltip title="Exclusion Risk Gradient - Lower is better">
                                          <StyledChip 
                                            label={`ERG: ${Math.round(clause.erg)}%`}
                                            color={COLORS.warning}
                                            size="small"
                                          />
                                        </Tooltip>
                                        <Tooltip title="Policy Ambiguity Index - Lower is clearer">
                                          <StyledChip 
                                            label={`PAI: ${clause.pai.toFixed(1)}`}
                                            color={COLORS.info}
                                            size="small"
                                          />
                                        </Tooltip>
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

      {/* Detail Dialog for Metric Breakdowns */}
      <DetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#2A2A2A', 
          color: 'white',
          borderBottom: `1px solid ${alpha(COLORS.primary, 0.3)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">{detailTitle}</Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: '#1E1E1E' }}>
          <DetailContent>
            <pre>
              {detailContent || 'No detailed calculation available'}
            </pre>
          </DetailContent>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2A2A2A', borderTop: `1px solid ${alpha(COLORS.primary, 0.3)}` }}>
          <Button onClick={handleCloseDialog} sx={{ color: COLORS.primary }}>
            Close
          </Button>
        </DialogActions>
      </DetailDialog>

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