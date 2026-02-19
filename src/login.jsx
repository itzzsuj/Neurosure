import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Chip,
  Avatar,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SecurityIcon from "@mui/icons-material/Security";

/* 🔥 FIREBASE */
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../src/firebase";

const COLORS = {
  primary: "#00695C",
  secondary: "#4DB6AC",
  accent: "#FF6F61",
  background: "#F5F5F5",
  textDark: "#263238",
  success: "#2E7D32",
  info: "#0288D1",
  gradient:
    "linear-gradient(135deg, #00695C 0%, #4DB6AC 50%, #FF6F61 100%)",
};

/* =====================================================
   ✨ STYLED COMPONENTS
===================================================== */

const LoginContainer = styled(Box)({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${alpha(
    COLORS.primary,
    0.05
  )}, ${alpha(COLORS.secondary, 0.08)})`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  position: "relative",
  overflow: "hidden",
});

const FloatingIcon = styled(Box)(({ delay }) => ({
  position: "absolute",
  animation: `float 6s ease-in-out infinite`,
  animationDelay: delay || "0s",
  opacity: 0.06,
  zIndex: 0,
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(5deg)" },
  },
}));

const StyledPaper = styled(Paper)({
  width: "100%",
  maxWidth: 460,
  padding: "48px 40px",
  borderRadius: "32px",
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
  boxShadow: `0 25px 60px ${alpha(COLORS.primary, 0.2)}`,
  position: "relative",
  zIndex: 2,
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: alpha(COLORS.primary, 0.02),
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: alpha(COLORS.primary, 0.04),
    },
    "&.Mui-focused": {
      backgroundColor: "white",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: COLORS.primary,
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: COLORS.primary,
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    color: alpha(COLORS.textDark, 0.4),
  },
});

const GradientButton = styled(Button)({
  background: COLORS.gradient,
  color: "white",
  borderRadius: "40px",
  padding: "14px 24px",
  fontWeight: 700,
  textTransform: "none",
  fontSize: "1rem",
  boxShadow: `0 8px 20px ${alpha(COLORS.primary, 0.25)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 28px ${alpha(COLORS.primary, 0.35)}`,
  },
  "&:disabled": {
    background: alpha(COLORS.primary, 0.3),
    color: "white",
  },
});

const GoogleButton = styled(Button)({
  borderRadius: "40px",
  padding: "14px 24px",
  backgroundColor: "#FFFFFF",
  color: "#757575",
  border: `1px solid ${alpha(COLORS.textDark, 0.15)}`,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#F8F9FA",
    borderColor: COLORS.primary,
    boxShadow: `0 8px 16px ${alpha(COLORS.primary, 0.1)}`,
    transform: "translateY(-2px)",
  },
  "& .MuiButton-startIcon": {
    marginRight: "12px",
  },
});

const BackButton = styled(Button)({
  color: COLORS.primary,
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  padding: "6px 12px",
  borderRadius: "30px",
  "&:hover": {
    background: alpha(COLORS.primary, 0.05),
  },
});

/* =====================================================
   🔐 LOGIN COMPONENT
===================================================== */

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 🔥 EMAIL PASSWORD LOGIN */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Logged in:", userCredential.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    }

    setLoading(false);
  };

  /* 🔥 GOOGLE LOGIN */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Google user:", result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <LoginContainer>
      {/* Floating Background Icons */}
      <FloatingIcon delay="0s" sx={{ top: "15%", left: "10%" }}>
        <PsychologyIcon sx={{ fontSize: 120, color: COLORS.primary }} />
      </FloatingIcon>
      <FloatingIcon delay="1.2s" sx={{ bottom: "15%", right: "10%" }}>
        <SecurityIcon sx={{ fontSize: 100, color: COLORS.secondary }} />
      </FloatingIcon>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 2 }}
      >
        <StyledPaper>
          {/* Back Button */}
          <BackButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ mb: 3 }}
          >
            Back to Home
          </BackButton>

          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: "0 auto 16px",
                background: COLORS.gradient,
                color: "white",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              NS
            </Avatar>
            
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: alpha(COLORS.textDark, 0.6) }}
            >
              Sign in to access your AI-powered insurance dashboard
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: "12px",
                "& .MuiAlert-icon": { color: COLORS.accent }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <StyledTextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: alpha(COLORS.textDark, 0.5) }}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Remember Me & Forgot Password */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: alpha(COLORS.primary, 0.5),
                        "&.Mui-checked": { color: COLORS.primary },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.7) }}>
                      Remember me
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{ 
                    color: COLORS.primary, 
                    cursor: "pointer",
                    fontWeight: 500,
                    "&:hover": { textDecoration: "underline" }
                  }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </Typography>
              </Box>

              {/* Sign In Button */}
              <GradientButton 
                type="submit" 
                fullWidth 
                disabled={loading}
                size="large"
              >
                {loading ? "Signing in..." : "Sign In"}
              </GradientButton>

              {/* Divider */}
              <Divider sx={{ my: 2 }}>
                <Chip 
                  label="OR" 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(COLORS.primary, 0.05),
                    color: alpha(COLORS.textDark, 0.6),
                    fontWeight: 500,
                  }}
                />
              </Divider>

              {/* Google Sign In - Proper Google Branding */}
              <GoogleButton
                fullWidth
                onClick={handleGoogleLogin}
                disabled={loading}
                startIcon={<GoogleIcon sx={{ color: "#4285F4" }} />}
              >
                Continue with Google
              </GoogleButton>

              {/* Sign Up Link */}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                  Don't have an account?{" "}
                  <Box
                    component="span"
                    sx={{
                      color: COLORS.primary,
                      fontWeight: 700,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </Box>
                </Typography>
              </Box>

              {/* Security Badges */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "center", 
                gap: 1.5,
                mt: 2,
              }}>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                  label="HIPAA Secure"
                  size="small"
                  sx={{ 
                    bgcolor: alpha(COLORS.success, 0.1), 
                    color: COLORS.success,
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label="256-bit Encryption"
                  size="small"
                  sx={{ 
                    bgcolor: alpha(COLORS.info, 0.1), 
                    color: COLORS.info,
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Stack>
          </form>
        </StyledPaper>
      </motion.div>
    </LoginContainer>
  );
};

export default Login;