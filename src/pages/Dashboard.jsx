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
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HealingIcon from "@mui/icons-material/Healing";

// Styles
import COLORS from "../styles/colors";

// =====================================================
// 📋 DISEASE OPTIONS
// =====================================================

const DISEASE_OPTIONS = [
  { value: "diabetes_type_2", label: "Diabetes Type 2", category: "Endocrine" },
  { value: "hypertension", label: "Hypertension", category: "Cardiovascular" },
  { value: "asthma", label: "Asthma", category: "Respiratory" },
  // ... (keep all your existing disease options)
];

// =====================================================
// ✨ STYLED COMPONENTS
// =====================================================

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
          ⚠️ Rows with lower opacity indicate weak matches (relevance {'<'} 30%) - not included in final scores
        </Typography>
      </Box>
    </TableContainer>
  );
};

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

const DetailDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    background: '#1E1E1E',
    color: '#FFFFFF',
    maxWidth: '800px',
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
  
  // Aggregate scores
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
            setSuccess('Document processed successfully!');
            clearInterval(interval);
            
            // Store file info for Claim Acceptance page
            if (uploadedFile) {
              localStorage.setItem('uploadedFile', JSON.stringify({
                name: uploadedFile.name,
                size: uploadedFile.size,
                jobId: jobId
              }));
            }
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
        setError('Lost connection to server.');
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
        setError('Failed to upload document.');
        setIsUploading(false);
        setUploadedFile(null);
      }
    } else {
      setError("Please upload a PDF file");
    }
  };

  // Parse detailed report
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

  // Get metric details
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
    } else {
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
  };

  // Click handlers
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

  // Clause extraction
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
        const formattedClauses = data.clauses.map((clause, index) => ({
          ...clause,
          id: clause.id || `clause_${index + 1}`,
          page_number: clause.page || clause.page_number || 1,
          relevance: clause.similarity_score || clause.relevance || 0,
          text: clause.text || "No text available",
          category: clause.category || "General",
          cds: clause.cds || 0,
          erg: clause.erg || 0,
          pai: clause.pai || 0,
          disease_mentioned: clause.disease_mentioned || false
        }));
        
        setClauses(formattedClauses);
        setQueriesUsed(data.queries_used || []);
        setCdsScore(data.cds_score || 0);
        setErgScore(data.erg_score || 0);
        setPaiScore(data.pai_score || 0);
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
      setError('Failed to extract clauses.');
    } finally {
      setIsAnalyzing(false);
      setApiLoading(false);
    }
  };

  // Reset
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
    
    // Clear stored file
    localStorage.removeItem('uploadedFile');
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
      default:
        return <ArticleIcon sx={{ color: COLORS.primary }} />;
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
    } else {
      if (score <= 0.3) return COLORS.success;
      if (score <= 0.6) return COLORS.warning;
      return COLORS.accent;
    }
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const toggleDetailedReport = () => {
    setShowDetailedReport(!showDetailedReport);
  };

  // Category weighting for top clauses
  const getCategoryWeight = (category) => {
    if (category === 'Exclusion' || category === 'Coverage') return 0.2;
    if (category === 'Waiting Period' || category === 'Pre-existing Condition') return 0.1;
    return 0;
  };

  const topClauses = [...clauses]
    .sort((a, b) => {
      const scoreA = a.relevance + getCategoryWeight(a.category);
      const scoreB = b.relevance + getCategoryWeight(b.category);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  const handleNavigateToClaim = () => {
    if (!uploadedFile) {
      setError("Please upload a policy document first");
      return;
    }
    navigate('/claim');
  };

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
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.background }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HealingIcon />}
              onClick={handleNavigateToClaim}
              disabled={!uploadedFile || uploadStatus !== 'completed'}
              sx={{
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.secondary },
                '&:disabled': { bgcolor: alpha(COLORS.primary, 0.3) },
              }}
            >
              Go to Claim Acceptance
            </Button>
            <Tooltip title="Refresh">
              <IconButton sx={{ bgcolor: "white", boxShadow: 2 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }} onClose={() => setSuccess("")}>
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
                      icon={<CheckCircleIcon />}
                      severity="success" 
                      sx={{ mt: 2, borderRadius: "12px" }}
                    >
                      Document processed successfully!
                    </Alert>
                  </Fade>
                )}

                {uploadedFile && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Button size="small" color="error" onClick={handleReset} startIcon={<CloseIcon />}>
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
                            sx={{ ml: 2, bgcolor: alpha(COLORS.primary, 0.1) }}
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
                    <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                      Running semantic search...
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
                        ? "Click 'Extract Relevant Clauses' to begin"
                        : "Select a disease and upload a policy document"
                      }
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary }}>
                          Results for {diseaseInfo?.label || selectedDisease}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {filteredClauses.length} of {clauses.length} clauses match
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssessmentIcon />}
                          onClick={toggleDetailedReport}
                          sx={{ borderRadius: "20px" }}
                        >
                          {showDetailedReport ? "Hide Details" : "View Details"}
                        </Button>
                        <TextField
                          size="small"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          sx={{ width: 150 }}
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

                    {/* Metric Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={4}>
                        <Box onClick={handleCdsClick} sx={{ cursor: 'pointer' }}>
                          <MetricCard color={getScoreColor(cdsScore, 'cds')}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                              <VerifiedIcon sx={{ color: COLORS.success, fontSize: 40 }} />
                              {getScoreIcon(cdsScore, 'cds')}
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.success }}>
                              {formatScore(cdsScore)}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                              Coverage Density
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                              Click for details
                            </Typography>
                          </MetricCard>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box onClick={handleErgClick} sx={{ cursor: 'pointer' }}>
                          <MetricCard color={getScoreColor(ergScore, 'erg')}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                              <WarningIcon sx={{ color: COLORS.warning, fontSize: 40 }} />
                              {getScoreIcon(ergScore, 'erg')}
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.warning }}>
                              {formatScore(ergScore)}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                              Exclusion Risk
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                              Click for details
                            </Typography>
                          </MetricCard>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box onClick={handlePaiClick} sx={{ cursor: 'pointer' }}>
                          <MetricCard color={getScoreColor(paiScore, 'pai')}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                              <GavelIcon sx={{ color: COLORS.info, fontSize: 40 }} />
                              {getScoreIcon(paiScore, 'pai')}
                            </Box>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: COLORS.info }}>
                              {formatScore(paiScore)}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textDark, mt: 1 }}>
                              Policy Ambiguity
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                              Click for details
                            </Typography>
                          </MetricCard>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Top Clauses */}
                    {topClauses.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <EmojiEventsIcon sx={{ color: COLORS.gold }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Top 3 Most Relevant Clauses
                          </Typography>
                        </Box>
                        {topClauses.map((clause, index) => (
                          <TopClauseCard key={index} clause={clause} rank={index + 1} />
                        ))}
                      </Box>
                    )}

                    {/* Detailed Analysis */}
                    {showDetailedReport && (
                      <Box sx={{ mb: 4 }}>
                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Comprehensive Metrics Analysis
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom>CDS Breakdown</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      • Strong clauses: {cdsBreakdown?.strongMatches || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      • Weak matches: {cdsBreakdown?.weakMatches || 0}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12}>
                                <ClauseAnalysisTable clauses={clauses} />
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}

                    {/* Tabs */}
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                      <Tab label={`All (${clauses.length})`} />
                      <Tab label={`Coverage (${clauses.filter(c => c.category === "Coverage").length})`} />
                      <Tab label={`Exclusions (${clauses.filter(c => c.category === "Exclusion").length})`} />
                      <Tab label={`Waiting (${clauses.filter(c => c.category === "Waiting Period").length})`} />
                      <Tab label={`Pre-existing (${clauses.filter(c => c.category === "Pre-existing Condition").length})`} />
                    </Tabs>

                    {/* Clause List */}
                    <List>
                      <AnimatePresence>
                        {filteredClauses.map((clause, index) => (
                          <motion.div
                            key={clause.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <ClauseCard sx={{ mb: 2 }}>
                              <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {getCategoryIcon(clause.category)}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {clause.category}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <StyledChip label={`CDS: ${Math.round(clause.cds)}%`} color={COLORS.success} />
                                    <StyledChip label={`ERG: ${Math.round(clause.erg)}%`} color={COLORS.warning} />
                                    <StyledChip label={`PAI: ${clause.pai.toFixed(1)}`} color={COLORS.info} />
                                  </Box>
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {clause.text}
                                </Typography>

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Chip icon={<PageviewIcon />} label={`Page ${clause.page_number}`} size="small" variant="outlined" />
                                  <Typography variant="caption">
                                    Relevance: {Math.round(clause.relevance * 100)}%
                                  </Typography>
                                </Box>
                              </CardContent>
                            </ClauseCard>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  </>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Detail Dialog */}
      <DetailDialog open={detailDialogOpen} onClose={handleCloseDialog} TransitionComponent={Zoom}>
        <DialogTitle sx={{ bgcolor: '#2A2A2A', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{detailTitle}</Typography>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#1E1E1E' }}>
          <DetailContent>
            <pre>{detailContent}</pre>
          </DetailContent>
        </DialogContent>
      </DetailDialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} />
    </Box>
  );
};

export default Dashboard;