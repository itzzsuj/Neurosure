import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

// Components
import Sidebar from "./components/Sidebar";

// Pages
import Main from "./landing/Main";
import Login from "./login";
import Signup from "./signup";
import ClaimAcceptance from "./pages/ClaimAcceptance";
import MedicalVault from "./pages/MedicalVault";
import PolicyComparison from "./pages/PolicyComparison";
import History from "./pages/History";
import Settings from "./pages/Settings";
import PatientRiskAnalysis from './pages/PatientRiskAnalysis';

const MainContent = styled(Box)({
  flex: 1,
  marginLeft: "280px",
  minHeight: "100vh",
  background: "#F5F5F5",
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - no sidebar */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes with sidebar */}
        <Route
          path="/claim"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <ClaimAcceptance />
              </MainContent>
            </Box>
          }
        />
        
        <Route
          path="/vault"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <MedicalVault />  {/* This should now work */}
              </MainContent>
            </Box>
          }
        />
        <Route
          path="/risk"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <PatientRiskAnalysis />
              </MainContent>
            </Box>
          }
        />
        
        <Route
          path="/compare"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <PolicyComparison />
              </MainContent>
            </Box>
          }
        />
        
        <Route
          path="/history"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <History />
              </MainContent>
            </Box>
          }
        />
        
        <Route
          path="/settings"
          element={
            <Box sx={{ display: "flex" }}>
              <Sidebar />
              <MainContent>
                <Settings />
              </MainContent>
            </Box>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;