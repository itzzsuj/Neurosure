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
  LinearProgress,
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
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";

/* 🔥 FIREBASE */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
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
  warning: "#ED6C02",
  gradient:
    "linear-gradient(135deg, #00695C 0%, #4DB6AC 50%, #FF6F61 100%)",
};

/* =====================================================
   ✨ STYLED COMPONENTS
===================================================== */

const SignupContainer = styled(Box)({
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
  maxWidth: 500,
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

const PasswordStrengthIndicator = styled(Box)(({ strength }) => ({
  height: "4px",
  width: "100%",
  background: alpha(COLORS.textDark, 0.1),
  borderRadius: "2px",
  marginTop: "8px",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: strength === "weak" ? "33%" : strength === "medium" ? "66%" : "100%",
    background: strength === "weak" ? COLORS.accent : strength === "medium" ? COLORS.warning : COLORS.success,
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
}));

/* =====================================================
   📝 SIGNUP COMPONENT
===================================================== */

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "agreeToTerms" ? checked : value
    }));

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      setError("Please enter your email");
      return false;
    }
    if (!formData.password) {
      setError("Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  /* 🔥 EMAIL PASSWORD SIGNUP */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with full name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });

      console.log("User created:", userCredential.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Signup failed. Please try again.");
      }
    }

    setLoading(false);
  };

  /* 🔥 GOOGLE SIGNUP */
  const handleGoogleSignup = async () => {
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
      setError("Google sign-up failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <SignupContainer>
      {/* Floating Background Icons */}
      <FloatingIcon delay="0s" sx={{ top: "10%", left: "5%" }}>
        <PsychologyIcon sx={{ fontSize: 140, color: COLORS.primary }} />
      </FloatingIcon>
      <FloatingIcon delay="1.2s" sx={{ bottom: "15%", right: "8%" }}>
        <SecurityIcon sx={{ fontSize: 120, color: COLORS.secondary }} />
      </FloatingIcon>
      <FloatingIcon delay="0.6s" sx={{ top: "60%", left: "12%" }}>
        <BadgeIcon sx={{ fontSize: 100, color: COLORS.accent }} />
      </FloatingIcon>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 500, position: "relative", zIndex: 2 }}
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
                width: 70,
                height: 70,
                margin: "0 auto 16px",
                background: COLORS.gradient,
                color: "white",
                fontSize: "2.2rem",
                fontWeight: 700,
              }}
            >
              NS
            </Avatar>
            
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1 }}
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: alpha(COLORS.textDark, 0.6) }}
            >
              Join NeuroSure for AI-powered insurance decisions
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Full Name */}
              <StyledTextField
                fullWidth
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email */}
              <StyledTextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <Box>
                <StyledTextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
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
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {formData.password && (
                  <>
                    <PasswordStrengthIndicator strength={passwordStrength} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        display: "block",
                        color: passwordStrength === "weak" 
                          ? COLORS.accent 
                          : passwordStrength === "medium" 
                          ? COLORS.warning 
                          : COLORS.success 
                      }}
                    >
                      {passwordStrength === "weak" && "Weak password"}
                      {passwordStrength === "medium" && "Medium strength"}
                      {passwordStrength === "strong" && "Strong password"}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Confirm Password */}
              <StyledTextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: alpha(COLORS.textDark, 0.5) }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Terms & Conditions */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    sx={{
                      color: alpha(COLORS.primary, 0.5),
                      "&.Mui-checked": { color: COLORS.primary },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.7) }}>
                    I agree to the{" "}
                    <Box
                      component="span"
                      sx={{ color: COLORS.primary, cursor: "pointer" }}
                      onClick={() => navigate("/terms")}
                    >
                      Terms of Service
                    </Box>{" "}
                    and{" "}
                    <Box
                      component="span"
                      sx={{ color: COLORS.primary, cursor: "pointer" }}
                      onClick={() => navigate("/privacy")}
                    >
                      Privacy Policy
                    </Box>
                  </Typography>
                }
              />

              {/* Sign Up Button */}
              <GradientButton 
                type="submit" 
                fullWidth 
                disabled={loading}
                size="large"
              >
                {loading ? "Creating Account..." : "Create Account"}
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

              {/* Google Sign Up */}
              <GoogleButton
                fullWidth
                onClick={handleGoogleSignup}
                disabled={loading}
                startIcon={<GoogleIcon sx={{ color: "#4285F4" }} />}
              >
                Sign up with Google
              </GoogleButton>

              {/* Sign In Link */}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                  Already have an account?{" "}
                  <Box
                    component="span"
                    sx={{
                      color: COLORS.primary,
                      fontWeight: 700,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Sign in
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
    </SignupContainer>
  );
};

export default Signup;