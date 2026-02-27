import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import COLORS from '../styles/colors';

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';

const SettingsCard = styled(Card)({
  borderRadius: '24px',
  background: 'white',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
});

const Settings = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.background, p: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Configure your application preferences
        </Typography>

        <SettingsCard>
          <CardContent sx={{ p: 3 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Receive alerts for claim evaluations"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Toggle dark theme (coming soon)"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    color="primary"
                    disabled
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Language" 
                  secondary="English (only)"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Security" 
                  secondary="Manage authentication and data privacy"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            </List>
          </CardContent>
        </SettingsCard>
      </Container>
    </Box>
  );
};

export default Settings;