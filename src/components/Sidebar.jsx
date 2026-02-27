import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import COLORS from '../styles/colors';

// Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';

const SidebarContainer = styled(Paper)({
  width: '280px',
  background: 'white',
  borderRadius: 0,
  borderRight: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  height: '100vh',
  zIndex: 10,
  boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
});

const NavItem = styled(ListItemButton)(({ active }) => ({
  borderRadius: '12px',
  marginBottom: '4px',
  padding: '12px 16px',
  backgroundColor: active ? alpha(COLORS.primary, 0.08) : 'transparent',
  color: active ? COLORS.primary : alpha(COLORS.textDark, 0.7),
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.05),
  },
  '& .MuiListItemIcon-root': {
    color: active ? COLORS.primary : alpha(COLORS.textDark, 0.7),
    minWidth: '40px',
  },
}));

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const menuItems = [
    { text: 'Claim Acceptance', icon: <CheckCircleIcon />, path: '/claim' },
    { text: 'Medical Vault', icon: <FolderIcon />, path: '/vault' },
    { text: 'Patient Risk Analysis', icon: <AssessmentIcon />, path: '/risk' },
    { text: 'Policy Comparison', icon: <CompareArrowsIcon />, path: '/compare' },
    { text: 'Analysis History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <SidebarContainer elevation={0}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 1 }}>
        <PsychologyIcon sx={{ color: COLORS.primary, fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textDark }}>
          NEUROSURE
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <NavItem
            key={item.text}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                fontSize: '0.95rem',
              }}
            />
          </NavItem>
        ))}
      </List>

      {/* User Profile */}
      <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(COLORS.primary, 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 1 }}>
          <Avatar sx={{ bgcolor: COLORS.primary, color: 'white' }}>
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, truncate: true }}>
              {user?.displayName || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6), display: 'block', truncate: true }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <NavItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </NavItem>
      </Box>
    </SidebarContainer>
  );
};

export default Sidebar;