import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I reset my password?",
    answer: [
      "1. Navigate to the Login screen and click 'Forgot Password'.",
      "2. Enter your registered email address.",
      "3. Follow the password reset link sent to your inbox to set a new password.",
    ],
  },
  {
    id: "faq-2",
    question: "How can I update my information?",
    answer: [
      "1. Click on your profile avatar at the top right of the dashboard.",
      "2. Select 'Personal Information' from the dropdown menu.",
      "3. Edit your contact name, phone, email, or address, then click 'Save Changes'.",
    ],
  },
  {
    id: "faq-3",
    question: "How do I contact support?",
    answer: [
      "If you encounter any bugs, technical glitches, or problems while using the app, you can easily report it to us:",
      "Go to your Profile or Settings tab.",
      "1. Tap on Help & Support (or Report a Problem).",
      "2. Describe the issue in detail (you can also attach a screenshot if needed).",
      "3. Tap Submit. Our team will look into it right away!",
    ],
  },
  {
    id: "faq-4",
    question: "How do I delete my account?",
    answer: [
      "To request account deletion, please contact your clinic Super Admin or reach out to support@dentivo.com for verification.",
    ],
  },
  {
    id: "faq-5",
    question: "How can I enable two-factor authentication?",
    answer: [
      "Go to Account Settings > Security and toggle 'Two-Factor Authentication (2FA)'. Follow the on-screen instructions using your preferred authenticator app.",
    ],
  },
  {
    id: "faq-6",
    question: "What should I do if my account is hacked?",
    answer: [
      "Immediately notify support@dentivo.com and your practice manager. Reset your password immediately if you still have email access.",
    ],
  },
  {
    id: "faq-7",
    question: "How do I manage doctor schedules and duty rosters?",
    answer: [
      "Go to Staff Management or Calendar in the sidebar menu to view duty schedules, configure consultation slots, and assign doctor shifts.",
    ],
  },
  {
    id: "faq-8",
    question: "How can I track patient appointments and requests?",
    answer: [
      "Navigate to 'Appointments' from the left sidebar. You can view all incoming booking requests, approve or reassign appointments, and filter by status.",
    ],
  },
  {
    id: "faq-9",
    question: "Where can I read the Terms of Service?",
    answer: [
      "You can review the Terms of Service and Privacy Policy by clicking 'Terms & Privacy' at the bottom of the user profile menu dropdown.",
    ],
  },
];

const AdminHelpCenterPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | false>("faq-3"); // FAQ 3 expanded by default matching Image 3

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedId(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.8rem", sm: "2.3rem" } }}>
          Help Centre
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
          Help & Knowledge Base
        </Typography>
      </Box>

      {/* Main Grid: Left Profile Card vs Right Help Centre Accordion (Matches Image 3) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" }, gap: 3, alignItems: "flex-start" }}>
        {/* LEFT COLUMN: Profile Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: 3,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 240,
              borderRadius: "20px",
              overflow: "hidden",
              backgroundColor: "#E2EDF2",
              mb: 2,
            }}
          >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
              alt="Dr. Robert Wilson"
              sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
            Dr. Robert Wilson
          </Typography>

          <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.82rem", mb: 1.5, display: "block" }}>
            General Dentist & Practice Manager
          </Typography>

          <Chip
            label="#DR-0123456"
            size="small"
            sx={{
              backgroundColor: "#2EBBD9",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.75rem",
              borderRadius: "8px",
              mb: 2,
            }}
          />

          <Box
            sx={{
              width: "100%",
              p: 1.8,
              borderRadius: "16px",
              backgroundColor: "#E6F8FA",
              border: "1px solid #C4EEF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShieldCheck size={18} color="#00ADC6" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#045E6A" }}>
                Admin Status
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#2EBBD9" }}>
              Active &amp; Verified
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT COLUMN: Help Center Accordion List */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 2.5, sm: 4 },
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2EDF2",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <HelpCircle size={24} color="#00ADC6" />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>
              Help Center
            </Typography>
          </Box>

          {/* Accordion FAQ Items */}
          {FAQ_DATA.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <Accordion
                key={faq.id}
                expanded={isExpanded}
                onChange={handleChange(faq.id)}
                elevation={0}
                sx={{
                  backgroundColor: "#E6F8FA",
                  borderRadius: "16px !important",
                  border: "1px solid #C4EEF5",
                  mb: "8px !important",
                  "&::before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={20} color="#045E6A" />}
                  sx={{
                    px: 2.5,
                    py: 1,
                    "& .MuiAccordionSummary-content": {
                      margin: "8px 0",
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#004552", fontSize: "0.95rem" }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0, backgroundColor: "#FFFFFF" }}>
                  <Box sx={{ pt: 2 }}>
                    {faq.answer.map((line, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: "#64748B", fontSize: "0.85rem", lineHeight: 1.6, mb: 0.5 }}>
                        {line}
                      </Typography>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminHelpCenterPage;
