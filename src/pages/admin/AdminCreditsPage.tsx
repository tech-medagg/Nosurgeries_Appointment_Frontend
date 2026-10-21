import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  InputBase,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Coins,
  TrendingUp,
  Users,
  CalendarCheck,
  Search,
  ChevronDown,
  Download,
} from "lucide-react";


export interface CreditTransaction {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  creditsUsed: number;
  status: "Completed" | "Pending" | "Refunded";
}

const MOCK_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  { id: "TX-1001", patientName: "Eleanor Vance", doctorName: "Dr. Michael Brown", department: "General Dentistry", date: "14 Jul 2026, 09:30 AM", creditsUsed: 10, status: "Completed" },
  { id: "TX-1002", patientName: "Marcus Brody", doctorName: "Dr. John Wilson", department: "Orthodontics", date: "14 Jul 2026, 10:15 AM", creditsUsed: 12, status: "Completed" },
  { id: "TX-1003", patientName: "Clara Oswald", doctorName: "Dr. Daniel Lee", department: "General Dentistry", date: "14 Jul 2026, 11:00 AM", creditsUsed: 10, status: "Completed" },
  { id: "TX-1004", patientName: "Arthur Pendelton", doctorName: "Dr. Benjamin Carter", department: "Pediatric Dentistry", date: "14 Jul 2026, 01:30 PM", creditsUsed: 15, status: "Completed" },
  { id: "TX-1005", patientName: "Sarah Connor", doctorName: "Dr. Alexander Reed", department: "Orthodontics", date: "13 Jul 2026, 03:00 PM", creditsUsed: 14, status: "Completed" },
  { id: "TX-1006", patientName: "David Miller", doctorName: "Dr. Mira Brown", department: "Pediatric Dentistry", date: "13 Jul 2026, 04:15 PM", creditsUsed: 12, status: "Completed" },
  { id: "TX-1007", patientName: "Emma Watson", doctorName: "Dr. Milton Saint", department: "General Dentistry", date: "12 Jul 2026, 10:00 AM", creditsUsed: 10, status: "Completed" },
];

const AdminCreditsPage: React.FC = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<"Monthly" | "Weekly" | "Yearly">("Monthly");
  const [timeframeAnchor, setTimeframeAnchor] = useState<null | HTMLElement>(null);

  const filteredTransactions = MOCK_CREDIT_TRANSACTIONS.filter(
    (tx) =>
      tx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.8rem", sm: "2.3rem" } }}>
            Credit Usage Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
            Track appointment credit consumption and department allocations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download size={18} />}
          sx={{
            backgroundColor: "#00ADC6",
            color: "#FFFFFF",
            borderRadius: "20px",
            px: 2.5,
            py: 0.8,
            textTransform: "none",
            fontWeight: 700,
            "&:hover": { backgroundColor: "#0091A8" },
          }}
        >
          Export Usage Report
        </Button>
      </Box>

      {/* Top Metric Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "20px", backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#E6F8FA", color: "#00ADC6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={24} />
            </Box>
            <Chip label="+16%" size="small" sx={{ backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 800 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>12,450</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Total Credits Used</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "20px", backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarCheck size={24} />
            </Box>
            <Chip label="Active" size="small" sx={{ backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: 800 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>400</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Appointments Processed</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "20px", backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#F3E8FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={24} />
            </Box>
            <Chip label="Avg Rate" size="small" sx={{ backgroundColor: "#F3E8FF", color: "#9333EA", fontWeight: 800 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>11.2</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Credits / Consultation</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "20px", backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={24} />
            </Box>
            <Chip label="Allocated" size="small" sx={{ backgroundColor: "#FEF3C7", color: "#B45309", fontWeight: 800 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>45,000</Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Clinic Pool Available</Typography>
        </Paper>
      </Box>

      {/* Credit Usage History Table */}
      <Paper elevation={0} sx={{ borderRadius: "20px", backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.2rem" }}>
            Recent Credit Transactions
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Paper elevation={0} sx={{ display: "flex", alignItems: "center", px: 2, py: 0.6, borderRadius: "20px", backgroundColor: "#F4F9FB", border: "1px solid #D5E8ED" }}>
              <Search size={16} color="#00ADC6" style={{ marginRight: 8 }} />
              <InputBase
                placeholder="Search patient or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: "0.85rem", color: "#111827" }}
              />
            </Paper>

            <Button
              onClick={(e) => setTimeframeAnchor(e.currentTarget)}
              endIcon={<ChevronDown size={16} />}
              sx={{ backgroundColor: "#045E6A", color: "#FFFFFF", borderRadius: "20px", px: 2, py: 0.6, textTransform: "none", fontWeight: 600, fontSize: "0.85rem" }}
            >
              {timeframe}
            </Button>

            <Menu anchorEl={timeframeAnchor} open={Boolean(timeframeAnchor)} onClose={() => setTimeframeAnchor(null)}>
              <MenuItem onClick={() => { setTimeframe("Monthly"); setTimeframeAnchor(null); }}>Monthly</MenuItem>
              <MenuItem onClick={() => { setTimeframe("Weekly"); setTimeframeAnchor(null); }}>Weekly</MenuItem>
              <MenuItem onClick={() => { setTimeframe("Yearly"); setTimeframeAnchor(null); }}>Yearly</MenuItem>
            </Menu>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1F2937" }}>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Patient Name</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Doctor</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Date & Time</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Credits Consumed</TableCell>
                <TableCell sx={{ color: "#FFFFFF", fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "#00ADC6" }}>{tx.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#111827" }}>{tx.patientName}</TableCell>
                  <TableCell sx={{ color: "#4B5563" }}>{tx.doctorName}</TableCell>
                  <TableCell sx={{ color: "#4B5563" }}>{tx.department}</TableCell>
                  <TableCell sx={{ color: "#6B7280", fontSize: "0.85rem" }}>{tx.date}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#111827" }}>{tx.creditsUsed} Credits</TableCell>
                  <TableCell>
                    <Chip label={tx.status} size="small" sx={{ backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 800, height: 22 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminCreditsPage;
