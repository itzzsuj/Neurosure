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
  Rating,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Icons
import PsychologyIcon from "@mui/icons-material/Psychology";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StorageIcon from "@mui/icons-material/Storage";
import TimelineIcon from "@mui/icons-material/Timeline";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderIcon from "@mui/icons-material/Folder";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";


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
  gradient:
    "linear-gradient(135deg, #00695C 0%, #4DB6AC 50%, #FF6F61 100%)",
};


const HeroSection = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  background: `linear-gradient(135deg, ${alpha(
    COLORS.primary,
    0.06
  )}, ${alpha(COLORS.secondary, 0.12)})`,
  paddingTop: "100px",
  position: "relative",
  overflow: "hidden",
});

const FloatingIcon = styled(Box)(({ delay }) => ({
  position: "absolute",
  animation: `float 6s ease-in-out infinite`,
  animationDelay: delay || "0s",
  opacity: 0.08,
  zIndex: 0,
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(5deg)" },
  },
}));

const GlassCard = styled(Paper)({
  padding: "32px",
  borderRadius: "32px",
  backdropFilter: "blur(14px)",
  background: "rgba(255,255,255,0.9)",
  border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
  boxShadow: `0 25px 50px ${alpha(COLORS.primary, 0.15)}`,
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
  },
});

const PremiumCard = styled(Card)({
  height: "100%",
  borderRadius: "24px",
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  boxShadow: `0 12px 28px ${alpha(COLORS.primary, 0.08)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.15)}`,
  },
});

const GradientText = styled(Typography)({
  background: COLORS.gradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 800,
});

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  marginBottom: "16px",
  color: COLORS.textDark,
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-8px",
    left: 0,
    width: "60px",
    height: "4px",
    background: COLORS.gradient,
    borderRadius: "2px",
  },
});

const ConfidenceBar = styled(Box)(({ value, color }) => ({
  height: "8px",
  width: "100%",
  background: alpha(COLORS.primary, 0.1),
  borderRadius: "4px",
  position: "relative",
  marginTop: "8px",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${value}%`,
    background: color || COLORS.primary,
    borderRadius: "4px",
    transition: "width 1s ease",
  },
}));



const HomePage = () => {
  return (
    <Box sx={{ background: COLORS.background, overflowX: "hidden" }}>
      <Navbar />

{/* =====================================================
   HERO SECTION — FLEXBOX PERFECT ALIGNMENT (FINAL)
===================================================== */}
{/* =====================================================
   HERO SECTION — FLEXBOX PERFECT ALIGNMENT (FINAL)
===================================================== */}

<HeroSection id="home">
  {/* Floating Background Icons */}
  <FloatingIcon delay="0s" sx={{ top: "12%", left: "8%" }}>
    <PsychologyIcon sx={{ fontSize: 110, color: COLORS.primary }} />
  </FloatingIcon>

  <FloatingIcon delay="1.5s" sx={{ top: "70%", right: "8%" }}>
    <BiotechIcon sx={{ fontSize: 90, color: COLORS.secondary }} />
  </FloatingIcon>

  <FloatingIcon delay="0.8s" sx={{ bottom: "15%", left: "12%" }}>
    <AnalyticsIcon sx={{ fontSize: 70, color: COLORS.accent }} />
  </FloatingIcon>

  <Container
    maxWidth="xl"
    sx={{
      position: "relative",
      zIndex: 2,
      height: "calc(100vh - 120px)",
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* FLEX WRAPPER */}
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: { xs: 6, md: 10 },
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* =====================================================
         LEFT SIDE
      ===================================================== */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 600,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: COLORS.primary,
                fontWeight: 600,
                letterSpacing: "0.5px",
                mb: 2,
                fontSize: "0.9rem",
              }}
            >
              INTELLIGENT INSURANCE DECISION SYSTEM
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3rem", lg: "3.4rem" },
                fontWeight: 700,
                mb: 2.5,
                lineHeight: 1.2,
                color: COLORS.textDark,
              }}
            >
              Transform Healthcare
              <br />
              Insurance Decisions with AI
            </Typography>

            <Typography
              sx={{
                color: alpha(COLORS.textDark, 0.7),
                mb: 4,
                lineHeight: 1.7,
                fontSize: "1.05rem",
                maxWidth: 500,
              }}
            >
              NeuroSure combines policy understanding, medical evidence,
              and patient history into an intelligent multimodal system
              that predicts claim eligibility and coverage confidence.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: COLORS.primary,
                  borderRadius: "40px",
                  px: 4,
                  py: 1.3,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 8px 16px ${alpha(COLORS.primary, 0.2)}`,
                }}
              >
                Get Started
              </Button>

              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: COLORS.primary,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Watch Demo
              </Button>
            </Stack>

            <Stack direction="row" spacing={4}>
              {["HIPAA Compliant", "AI-Powered", "Secure Vault"].map(
                (item, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: alpha(COLORS.textDark, 0.6) }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Stack>
          </motion.div>
        </Box>
      </Box>

      {/* =====================================================
         RIGHT SIDE — COMPLETE DASHBOARD
      ===================================================== */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 480,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: "100%" }}
        >
          <Box sx={{ position: "relative" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                background: "white",
                border: `1px solid ${alpha(COLORS.primary, 0.12)}`,
                boxShadow: `0 25px 50px ${alpha(COLORS.primary, 0.15)}`,
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* HEADER */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.accent,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: alpha(COLORS.textDark, 0.5), fontWeight: 500 }}
                >
                  LIVE ANALYSIS · REAL-TIME
                </Typography>
              </Box>

              {/* DOCUMENT CHIPS */}
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<DescriptionIcon />}
                  label="Policy Document"
                  size="small"
                  sx={{ background: alpha(COLORS.primary, 0.05), color: COLORS.textDark }}
                />
                <Chip
                  icon={<CameraAltIcon />}
                  label="Medical Images"
                  size="small"
                  sx={{ background: alpha(COLORS.secondary, 0.05), color: COLORS.textDark }}
                />
                <Chip
                  icon={<MenuBookIcon />}
                  label="Disease Glossary"
                  size="small"
                  sx={{ background: alpha(COLORS.info, 0.05), color: COLORS.info }}
                />
                <Chip
                  icon={<FolderIcon />}
                  label="Patient History"
                  size="small"
                  sx={{ background: alpha(COLORS.warning, 0.05), color: COLORS.warning }}
                />
              </Box>

              {/* POLICY ANALYSIS CARD */}
              <Card
                sx={{
                  bgcolor: alpha(COLORS.primary, 0.02),
                  borderRadius: "16px",
                  mb: 2,
                  border: `1px solid ${alpha(COLORS.primary, 0.08)}`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      HEALTH-ADV-2024
                    </Typography>
                    <Chip
                      label="Diabetes Type 2"
                      size="small"
                      sx={{
                        bgcolor: alpha(COLORS.primary, 0.1),
                        color: COLORS.primary,
                        height: 22,
                      }}
                    />
                  </Box>

                  {/* Coverage Density */}
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                    Coverage Density Score (CDS)
                  </Typography>
                  <Box
                    sx={{
                      height: 6,
                      bgcolor: alpha(COLORS.primary, 0.1),
                      borderRadius: 3,
                      position: "relative",
                      mb: 2,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: "87%",
                        bgcolor: COLORS.primary,
                        borderRadius: 3,
                      },
                    }}
                  />

                  {/* Metrics Row */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Exclusion Risk
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.warning }}>
                        23% · Low
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Ambiguity Index
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.info }}>
                        0.12 · Low
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* PREDICTION RESULT */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.success, 0.08),
                  borderRadius: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Eligibility Prediction
                  </Typography>
                  <Typography variant="h6" sx={{ color: COLORS.success, fontWeight: 700 }}>
                    Likely Approved
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.primary }}>
                    Claimable: $15,750
                  </Typography>
                </Box>
                <VerifiedIcon sx={{ color: COLORS.success, fontSize: 32 }} />
              </Box>

              {/* CONFIDENCE BAR */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Decision Confidence
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    94%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 6,
                    bgcolor: alpha(COLORS.primary, 0.1),
                    borderRadius: 3,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: "94%",
                      background: COLORS.gradient,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Decorative Glow Elements */}
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 180,
                height: 180,
                background: `radial-gradient(circle, ${alpha(
                  COLORS.primary,
                  0.1
                )} 0%, transparent 70%)`,
                borderRadius: "50%",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 180,
                height: 180,
                background: `radial-gradient(circle, ${alpha(
                  COLORS.secondary,
                  0.08
                )} 0%, transparent 70%)`,
                borderRadius: "50%",
                zIndex: 1,
              }}
            />
          </Box>
        </motion.div>
      </Box>
    </Box>
  </Container>
</HeroSection>
      {/* =====================================================
         APPROACH SECTION — FULL APPROACH
      ===================================================== */}

      <Container maxWidth="lg" sx={{ py: 12 }} id="about">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <SectionTitle variant="h2" sx={{ "&::after": { left: "50%", transform: "translateX(-50%)" } }}>
              Our Intelligent Approach
            </SectionTitle>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: "32px",
              background: "white",
              border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
              boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.08)}`,
            }}
          >
            <Typography
              sx={{
                lineHeight: 1.9,
                fontSize: "1.1rem",
                color: COLORS.textDark,
              }}
            >
              A retrieval module extracts relevant clauses for the selected
              disease or procedure, after which multiple machine-learning models
              analyze the context — the <strong>Coverage Density Score (CDS)</strong> measures how strongly a policy discusses a condition, the <strong>Exclusion Risk Gradient (ERG)</strong> evaluates rejection risk from restrictive clauses, and the <strong>Policy Ambiguity Index (PAI)</strong> detects unclear or conflicting policy language. Medical images are processed through a CNN to validate clinical evidence, and historical claim patterns generate a <strong>Behavioral Reliability Score</strong> reflecting long-term consistency. These multimodal signals are fused using an attention-based neural network and a neuro-fuzzy confidence layer to predict claim eligibility, estimated claimable percentage, and overall decision confidence. Supported by an MLOps monitoring dashboard for tracking model performance, the platform blends GenAI-driven policy retrieval with advanced machine-learning decision models to transform complex insurance policies into clear, explainable insights.
            </Typography>
          </Paper>
        </motion.div>
      </Container>

      {/* =====================================================
         METRICS GRID — PREMIUM ALIGNMENT
      ===================================================== */}

      <Container
  maxWidth="lg"
  sx={{
    pb: { xs: 10, md: 14 },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  {/* ================= HEADER ================= */}
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    style={{ width: "100%" }}
  >
    <Box
      sx={{
        textAlign: "center",
        mb: { xs: 6, md: 8 },
        maxWidth: 720,
        mx: "auto",
      }}
    >
      <SectionTitle
        variant="h2"
        sx={{
          "&::after": {
            left: "50%",
            transform: "translateX(-50%)",
          },
        }}
      >
        NeuroSure Intelligence Engine
      </SectionTitle>

      <Typography
        sx={{
          color: alpha(COLORS.textDark, 0.7),
          mt: 2,
          lineHeight: 1.7,
        }}
      >
        Hybrid neuro-attentive AI combining policy understanding,
        medical evidence, and predictive analytics for transparent
        insurance decisions
      </Typography>
    </Box>
  </motion.div>

  {/* ================= FLEXBOX GRID ================= */}
  <Box
    sx={{
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      gap: 3,
      justifyContent: "center",
    }}
  >
    {[
      {
        icon: <BubbleChartIcon sx={{ fontSize: 40 }} />,
        title: "Coverage Density Score (CDS)",
        desc: "Measures how strongly a policy discusses a condition",
        color: COLORS.primary,
        detail: "Semantic clause retrieval + contextual scoring",
      },
      {
        icon: <WarningIcon sx={{ fontSize: 40 }} />,
        title: "Exclusion Risk Gradient (ERG)",
        desc: "Evaluates rejection risk from restrictive clauses",
        color: COLORS.warning,
        detail: "Detects exclusions, waiting periods, hidden conditions",
      },
      {
        icon: <ErrorIcon sx={{ fontSize: 40 }} />,
        title: "Policy Ambiguity Index (PAI)",
        desc: "Identifies unclear or conflicting policy wording",
        color: COLORS.info,
        detail: "Highlights ambiguous language affecting coverage",
      },
      {
        icon: <TimelineIcon sx={{ fontSize: 40 }} />,
        title: "Behavioral Reliability Score",
        desc: "Analyzes historical claim patterns & patient history",
        color: COLORS.success,
        detail: "ML models evaluate long-term behavioral consistency",
      },
      {
        icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
        title: "Disease Glossary Engine",
        desc: "Standardizes medical terminology across documents",
        color: COLORS.secondary,
        detail: "Bridges clinical terms with insurance language",
      },
      {
        icon: <StorageIcon sx={{ fontSize: 40 }} />,
        title: "Secure Medical Vault",
        desc: "Encrypted storage for reports, scans, and policy files",
        color: COLORS.primary,
        detail: "Supports multimodal analysis with privacy compliance",
      },
      {
        icon: <PsychologyAltIcon sx={{ fontSize: 40 }} />,
        title: "Neuro-Attentive Fusion Model",
        desc: "Combines policy, medical, and historical signals",
        color: COLORS.accent,
        detail: "Attention-based neural network + neuro-fuzzy layer",
      },
      {
        icon: <InsightsIcon sx={{ fontSize: 40 }} />,
        title: "Explainable Claim Prediction",
        desc: "Predicts eligibility, claimable percentage, and confidence",
        color: COLORS.success,
        detail: "Transparent reasoning with explainable AI outputs",
      },
    ].map((metric, i) => (
      <Box
        key={i}
        sx={{
          width: {
            xs: "100%",
            sm: "calc(50% - 12px)",
            md: "calc(33.333% - 16px)",
          },
          minWidth: {
            xs: "100%",
            sm: "300px",
            md: "320px",
          },
          display: "flex",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          viewport={{ once: true }}
          style={{ width: "100%", display: "flex" }}
        >
          <PremiumCard
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 20px 40px ${alpha(COLORS.primary, 0.15)}`,
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box sx={{ color: metric.color, mb: 2 }}>
                {metric.icon}
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.4 }}
              >
                {metric.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: alpha(COLORS.textDark, 0.7),
                  mb: 2,
                  flex: 1,
                  lineHeight: 1.6,
                }}
              >
                {metric.desc}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="caption"
                sx={{
                  color: alpha(COLORS.textDark, 0.6),
                  fontStyle: "italic",
                  display: "block",
                  lineHeight: 1.6,
                }}
              >
                {metric.detail}
              </Typography>
            </CardContent>
          </PremiumCard>
        </motion.div>
      </Box>
    ))}
  </Box>
</Container>

      {/* =====================================================
         TESTIMONIALS SECTION
      ===================================================== */}

      <Box sx={{ py: 12, background: alpha(COLORS.primary, 0.02) }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <SectionTitle variant="h2" sx={{ "&::after": { left: "50%", transform: "translateX(-50%)" } }}>
                Trusted by Healthcare Leaders
              </SectionTitle>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Medical Director, City Hospital",
                quote: "The disease glossary and policy analysis have transformed how we evaluate claims. The multimodal approach captures nuances we used to miss.",
              },
              {
                name: "Michael Chen",
                role: "Insurance Analyst, HealthPlus",
                quote: "CDS and ERG metrics provide clear insights into policy coverage. The platform explains exactly why a claim might be approved or denied.",
              },
              {
                name: "Dr. Emily Rodriguez",
                role: "Chief of Medicine, Regional Health",
                quote: "Having medical images, patient history, and policy analysis in one workflow saves hours. The confidence scoring helps us make better decisions.",
              },
            ].map((testimonial, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PremiumCard>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: COLORS.gradient, color: "white" }}>
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(COLORS.textDark, 0.6) }}>
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={5} readOnly size="small" sx={{ mb: 2, color: COLORS.accent }} />
                      <Typography variant="body2" sx={{ color: alpha(COLORS.textDark, 0.8), fontStyle: "italic" }}>
                        "{testimonial.quote}"
                      </Typography>
                    </CardContent>
                  </PremiumCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =====================================================
         CTA — ULTRA PREMIUM
      ===================================================== */}

      <Box sx={{ py: 12, background: COLORS.gradient, position: "relative", overflow: "hidden" }}>
        {/* Floating icons */}
        <FloatingIcon delay="0s" sx={{ top: "20%", left: "10%", opacity: 0.1 }}>
          <PsychologyIcon sx={{ fontSize: 80, color: "white" }} />
        </FloatingIcon>
        <FloatingIcon delay="1.5s" sx={{ bottom: "20%", right: "10%", opacity: 0.1 }}>
          <BiotechIcon sx={{ fontSize: 80, color: "white" }} />
        </FloatingIcon>

        <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "2.2rem", md: "3rem" },
              }}
            >
              Ready to Make Smarter Insurance Decisions?
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                mb: 4,
                fontSize: "1.2rem",
                lineHeight: 1.6,
              }}
            >
              Join leading healthcare providers using NeuroSure to transform complex policies into clear, actionable insights.
            </Typography>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: "white",
                color: COLORS.primary,
                borderRadius: "40px",
                px: 6,
                py: 2,
                fontWeight: 700,
                fontSize: "1.2rem",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "rgba(255,255,255,0.95)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
                },
              }}
            >
              Start with NeuroSure
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default HomePage;