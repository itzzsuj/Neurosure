import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const COLORS = {
  primary: "#00695C",
  secondary: "#4DB6AC",
  accent: "#FF6F61",
  background: "#F5F5F5",
  textDark: "#263238",
  textLight: "#FFFFFF",
};

const Footer = () => {
  return (
    <Box sx={{ background: COLORS.textDark, color: "white", pt: 6 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PsychologyIcon sx={{ color: COLORS.secondary, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                NEUROSURE
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.7), mb: 3, lineHeight: 1.8 }}>
              Transforming insurance decisions with AI-powered intelligence. 
              Making healthcare coverage smarter, faster, and more accessible.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ color: COLORS.secondary, "&:hover": { color: COLORS.accent } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: COLORS.secondary, "&:hover": { color: COLORS.accent } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton sx={{ color: COLORS.secondary, "&:hover": { color: COLORS.accent } }}>
                <LinkedInIcon />
              </IconButton>
              <IconButton sx={{ color: COLORS.secondary, "&:hover": { color: COLORS.accent } }}>
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {["Home", "About Us", "Services", "Contact"].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: alpha("#FFFFFF", 0.7),
                    cursor: "pointer",
                    "&:hover": { color: COLORS.accent },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary }}>
              Resources
            </Typography>
            <Stack spacing={1}>
              {["Documentation", "API Reference", "Case Studies", "Blog"].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: alpha("#FFFFFF", 0.7),
                    cursor: "pointer",
                    "&:hover": { color: COLORS.accent },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.7), mb: 2 }}>
              Subscribe to our newsletter for the latest updates and insights.
            </Typography>
            <Box component="form" sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Email address"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: alpha("#FFFFFF", 0.3),
                    },
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary,
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  background: COLORS.accent,
                  "&:hover": { background: COLORS.primary },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: alpha("#FFFFFF", 0.1) }} />

        {/* Bottom Bar */}
        <Box sx={{ py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.5) }}>
            © 2024 NEUROSURE. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.5), cursor: "pointer", "&:hover": { color: COLORS.accent } }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.5), cursor: "pointer", "&:hover": { color: COLORS.accent } }}>
              Terms of Service
            </Typography>
            <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.5), cursor: "pointer", "&:hover": { color: COLORS.accent } }}>
              Cookie Policy
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;