import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Fab,
  Alert,
  Snackbar,
  Tab,
  Tabs,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
  startAfter,
  where 
} from 'firebase/firestore';
import COLORS from '../styles/colors';

// Components
import PatientList from '../components/vault/PatientList';
import PatientDetailModal from '../components/vault/PatientDetailModal';
import AddPatientForm from '../components/vault/AddPatientForm';
import VaultStats from '../components/vault/VaultStats';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
});

const SearchBar = styled(Paper)({
  padding: '4px 8px 4px 16px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '400px',
  borderRadius: '40px',
  border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
  '&:hover': {
    borderColor: COLORS.primary,
  },
});

const MedicalVault = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  // State
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalClaims: 0,
    approvalRate: 0,
    highRiskCount: 0
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load patients from Firestore
  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    setLoadingData(true);
    setError('');
    
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const patientList = [];
      let totalClaims = 0;
      let approvedClaims = 0;
      
      querySnapshot.forEach((doc) => {
        const patientData = { id: doc.id, ...doc.data() };
        patientList.push(patientData);
        
        // Calculate stats
        if (patientData.claims) {
          totalClaims += patientData.claims.length;
          approvedClaims += patientData.claims.filter(c => c.approved).length;
        }
      });
      
      setPatients(patientList);
      setFilteredPatients(patientList);
      
      // Update stats
      setStats({
        totalPatients: patientList.length,
        totalClaims: totalClaims,
        approvalRate: totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
        highRiskCount: patientList.filter(p => (p.brsScore || 0) < 0.4).length
      });
      
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.primaryCondition?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handleAddPatient = async (patientData) => {
    try {
      const patientsRef = collection(db, 'patients');
      const newPatient = {
        ...patientData,
        patientId: `P${String(patients.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        claims: [],
        createdBy: user.uid
      };
      
      await addDoc(patientsRef, newPatient);
      setSuccess('Patient added successfully!');
      setAddModalOpen(false);
      loadPatients(); // Reload list
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again.');
    }
  };

  const handleAddClaim = async (patientId, claimData) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const patient = patients.find(p => p.id === patientId);
      
      const updatedClaims = [...(patient.claims || []), {
        ...claimData,
        claimId: `C${String((patient.claims?.length || 0) + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0]
      }];
      
      await updateDoc(patientRef, {
        claims: updatedClaims,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Claim added successfully!');
      setModalOpen(false);
      loadPatients(); // Reload list
    } catch (err) {
      console.error('Error adding claim:', err);
      setError('Failed to add claim. Please try again.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      const patientRef = doc(db, 'patients', patientId);
      await deleteDoc(patientRef);
      setSuccess('Patient deleted successfully!');
      loadPatients(); // Reload list
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading || loadingData) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, p: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <PageHeader>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}>
                🏥 Medical Vault
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Store and manage patient medical records and claim history
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                bgcolor: COLORS.primary,
                '&:hover': { bgcolor: COLORS.secondary },
                borderRadius: '40px',
                px: 4,
                py: 1.5
              }}
            >
              Add New Patient
            </Button>
          </PageHeader>

          {/* Error/Success Alerts */}
          {error && <ErrorAlert message={error} onClose={() => setError('')} />}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <VaultStats stats={stats} />

          {/* Search and Tabs */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <SearchBar>
                  <SearchIcon sx={{ color: alpha(COLORS.textDark, 0.5), mr: 1 }} />
                  <TextField
                    fullWidth
                    placeholder="Search by name, ID, or condition..."
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                  />
                </SearchBar>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={loadPatients}
                    sx={{ color: COLORS.primary }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              sx={{ mt: 2, borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}` }}
            >
              <Tab label={`All Patients (${filteredPatients.length})`} />
              <Tab label="High Risk" />
              <Tab label="Recent Claims" />
            </Tabs>
          </Paper>

          {/* Patient List */}
          <PatientList
            patients={filteredPatients}
            onView={handleViewPatient}
            onDelete={handleDeletePatient}
            tabValue={tabValue}
          />
        </motion.div>
      </Container>

      {/* Modals */}
      <PatientDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={selectedPatient}
        onAddClaim={handleAddClaim}
      />

      <AddPatientForm
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddPatient}
      />

      {/* Snackbar */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error || success}
      />
    </Box>
  );
};

export default MedicalVault;