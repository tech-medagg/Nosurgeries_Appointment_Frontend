import React, { useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  ChevronDown,
  Plus,
  Phone,
  MoreHorizontal,
  ArrowLeft,
  Star,
  Users,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  UploadCloud,
  Camera,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ======================================================
   Types & Interfaces
====================================================== */

export interface StaffDoctor {
  id: string;
  doctorCode: string;
  name: string;
  specialist: string;
  category: "General Dentist" | "Pediatric" | "Orthodontist";
  schedule: string;
  scheduleHours: string;
  status: "Available" | "Unavailable";
  phone: string;
  email: string;
  experience: string;
  creditsRate: number;
  avatar: string;
  totalAppointments: number;
  totalPatients: number;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  doctorName: string;
  admissionDate: string;
  status: "Admitted" | "In-Treatment" | "Discharged";
}

export interface DoctorFeedback {
  id: string;
  patientName: string;
  comment: string;
  date: string;
  rating: number;
}

/* ======================================================
   Mock Data (Matches Screenshots 1 & 2)
====================================================== */

const MOCK_STAFF_DOCTORS: StaffDoctor[] = [
  {
    id: "doc-1",
    doctorCode: "DR-0123456",
    name: "Dr. Michael Brown",
    specialist: "General Dentist",
    category: "General Dentist",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available",
    phone: "(+2) 012 123 456 789",
    email: "brwn@gmail.com",
    experience: "14+ Years",
    creditsRate: 10,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 400,
    totalPatients: 350,
  },
  {
    id: "doc-2",
    doctorCode: "DR-0123457",
    name: "Dr. John Wilson",
    specialist: "Orthodontist",
    category: "Orthodontist",
    schedule: "Sun–Thu",
    scheduleHours: "10:30–18:30",
    status: "Available",
    phone: "(+2) 111 222 333 444",
    email: "wilson@gmail.com",
    experience: "10+ Years",
    creditsRate: 12,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 365,
    totalPatients: 310,
  },
  {
    id: "doc-3",
    doctorCode: "DR-0123458",
    name: "Dr. Daniel Lee",
    specialist: "General Dentist",
    category: "General Dentist",
    schedule: "Sat–Fri",
    scheduleHours: "09:30–15:30",
    status: "Available",
    phone: "(+2) 222 333 444 555",
    email: "lee@gmail.com",
    experience: "8+ Years",
    creditsRate: 10,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 400,
    totalPatients: 340,
  },
  {
    id: "doc-4",
    doctorCode: "DR-0123459",
    name: "Dr. Benjamin Carter",
    specialist: "Pediatric Dentist",
    category: "Pediatric",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available",
    phone: "(+2) 333 444 555 666",
    email: "carter@gmail.com",
    experience: "12+ Years",
    creditsRate: 15,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 320,
    totalPatients: 290,
  },
  {
    id: "doc-5",
    doctorCode: "DR-0123460",
    name: "Dr. Alexander Reed",
    specialist: "Orthodontist",
    category: "Orthodontist",
    schedule: "Sun–Wed",
    scheduleHours: "11:30–16:30",
    status: "Available",
    phone: "(+2) 444 555 666 777",
    email: "reed@gmail.com",
    experience: "11+ Years",
    creditsRate: 14,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 380,
    totalPatients: 330,
  },
  {
    id: "doc-6",
    doctorCode: "DR-0123461",
    name: "Dr. Mira Brown",
    specialist: "Pediatric Dentist",
    category: "Pediatric",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available",
    phone: "(+2) 555 666 777 888",
    email: "mira@gmail.com",
    experience: "9+ Years",
    creditsRate: 12,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 290,
    totalPatients: 260,
  },
  {
    id: "doc-7",
    doctorCode: "DR-0123462",
    name: "Dr. Alice Frank",
    specialist: "General Dentist",
    category: "General Dentist",
    schedule: "Sun–Tue",
    scheduleHours: "10:30–18:30",
    status: "Unavailable",
    phone: "(+2) 666 777 888 999",
    email: "alice@gmail.com",
    experience: "7+ Years",
    creditsRate: 10,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 210,
    totalPatients: 190,
  },
  {
    id: "doc-8",
    doctorCode: "DR-0123463",
    name: "Dr. Milton Saint",
    specialist: "General Dentist",
    category: "General Dentist",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available",
    phone: "(+2) 777 888 999 000",
    email: "milton@gmail.com",
    experience: "15+ Years",
    creditsRate: 12,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 410,
    totalPatients: 360,
  },
  {
    id: "doc-9",
    doctorCode: "DR-0123464",
    name: "Dr. Alina Wilson",
    specialist: "Pediatric Dentist",
    category: "Pediatric",
    schedule: "Sun–Thu",
    scheduleHours: "09:30–15:30",
    status: "Available",
    phone: "(+2) 888 999 000 111",
    email: "alina@gmail.com",
    experience: "6+ Years",
    creditsRate: 10,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 270,
    totalPatients: 240,
  },
  {
    id: "doc-10",
    doctorCode: "DR-0123465",
    name: "Dr. Mag Giver",
    specialist: "Orthodontist",
    category: "Orthodontist",
    schedule: "Sat–Fri",
    scheduleHours: "08:30–14:30",
    status: "Available",
    phone: "(+2) 999 000 111 222",
    email: "mag@gmail.com",
    experience: "13+ Years",
    creditsRate: 14,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 390,
    totalPatients: 345,
  },
  {
    id: "doc-11",
    doctorCode: "DR-0123466",
    name: "Dr. Lucy Carl",
    specialist: "General Dentist",
    category: "General Dentist",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available",
    phone: "(+2) 123 234 345 456",
    email: "lucy@gmail.com",
    experience: "9+ Years",
    creditsRate: 10,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 305,
    totalPatients: 275,
  },
  {
    id: "doc-12",
    doctorCode: "DR-0123467",
    name: "Dr. Jemmy Obama",
    specialist: "Pediatric Dentist",
    category: "Pediatric",
    schedule: "Sun–Tue",
    scheduleHours: "10:30–18:30",
    status: "Available",
    phone: "(+2) 234 345 456 567",
    email: "jemmy@gmail.com",
    experience: "8+ Years",
    creditsRate: 11,
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    totalAppointments: 285,
    totalPatients: 250,
  },
];

const MOCK_PATIENTS_LIST: PatientRecord[] = [
  { id: "p1", name: "Alice Saint", age: 40, gender: "Male", condition: "Bleeding Gums", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "Admitted" },
  { id: "p2", name: "Lucas Anton", age: 45, gender: "Male", condition: "Tooth Sensitivity", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "In-Treatment" },
  { id: "p3", name: "Thomas Charls", age: 56, gender: "Male", condition: "Calculus build-up", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "Admitted" },
  { id: "p4", name: "Nice Patel", age: 40, gender: "Female", condition: "Bad Breath", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "Admitted" },
  { id: "p5", name: "Gems Yamal", age: 29, gender: "Male", condition: "Tooth Sensitivity", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "In-Treatment" },
  { id: "p6", name: "Aldrik Asher", age: 40, gender: "Male", condition: "Tooth Decay", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "Admitted" },
  { id: "p7", name: "Alice Saint", age: 37, gender: "Male", condition: "Calculus build-up", doctorName: "Dr. Brasses Saint", admissionDate: "19–07–2026 06:15AM", status: "Discharged" },
];

const MOCK_FEEDBACK: DoctorFeedback[] = [
  {
    id: "f1",
    patientName: "Nicholas",
    comment: "Highly professional and empathetic doctor! The treatment plan worked wonderfully, and I saw a great improvement in my health.",
    date: "20.07.2026",
    rating: 4.8,
  },
  {
    id: "f2",
    patientName: "Charls bebej",
    comment: "is incredibly knowledgeable and compassionate. The treatment was very effective.",
    date: "20.07.2026",
    rating: 4.8,
  },
  {
    id: "f3",
    patientName: "Thomas Aldin",
    comment: "Exceptional medical experience! Great treatment combined with a kind and reassuring attitude.",
    date: "20.07.2026",
    rating: 4.8,
  },
];

const AdminStaffPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.email ? user.email.split("@")[0] : "Robert";

  // State Management
  const [doctorsList, setDoctorsList] = useState<StaffDoctor[]>(MOCK_STAFF_DOCTORS);
  const [selectedCategory, setSelectedCategory] = useState<"All" | "General Dentist" | "Pediatric" | "Orthodontist">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Available" | "Unavailable">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);

  // Selected Doctor Detail View state
  const [selectedDoctor, setSelectedDoctor] = useState<StaffDoctor | null>(null);

  // Patient List Timeframe anchor
  const [patientTimeframeAnchor, setPatientTimeframeAnchor] = useState<null | HTMLElement>(null);
  const [patientTimeframe, setPatientTimeframe] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");

  // Selected Schedule Day in Detail view
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<number>(14);

  // Modal State for Add Doctor
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [newDocData, setNewDocData] = useState({
    name: "",
    specialist: "General Dentist",
    category: "General Dentist" as "General Dentist" | "Pediatric" | "Orthodontist",
    schedule: "Mon–Fri",
    scheduleHours: "08:30–16:30",
    status: "Available" as "Available" | "Unavailable",
    phone: "",
    email: "",
    experience: "5+ Years",
    creditsRate: 10,
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
      const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.phone.includes(searchQuery);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [doctorsList, selectedCategory, statusFilter, searchQuery]);

  // Handle Add Doctor Submit
  const handleAddDoctorSubmit = () => {
    if (!newDocData.name) return;
    const finalAvatar =
      imagePreviewUrl ||
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";

    const newDoc: StaffDoctor = {
      id: `doc-${Date.now()}`,
      doctorCode: `DR-${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: newDocData.name.startsWith("Dr.") ? newDocData.name : `Dr. ${newDocData.name}`,
      specialist: newDocData.specialist,
      category: newDocData.category,
      schedule: newDocData.schedule,
      scheduleHours: newDocData.scheduleHours,
      status: newDocData.status,
      phone: newDocData.phone || "(+2) 000 111 222",
      email: newDocData.email || "doctor@dentivo.com",
      experience: newDocData.experience,
      creditsRate: Number(newDocData.creditsRate) || 10,
      avatar: finalAvatar,
      totalAppointments: 100,
      totalPatients: 85,
    };

    setDoctorsList([newDoc, ...doctorsList]);
    setAddDoctorOpen(false);
    setImagePreviewUrl("");
    setNewDocData({
      name: "",
      specialist: "General Dentist",
      category: "General Dentist",
      schedule: "Mon–Fri",
      scheduleHours: "08:30–16:30",
      status: "Available",
      phone: "",
      email: "",
      experience: "5+ Years",
      creditsRate: 10,
    });
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* ======================================================
          HEADER (Greeting + Subtitle + Action Controls)
      ====================================================== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#111827",
              fontSize: { xs: "1.8rem", sm: "2.3rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Welcome back,{" "}
            <Box component="span" sx={{ color: "#2EBBD9" }}>
              {userName}
            </Box>
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, color: "#6B7280" }}>
            <Clock size={16} color="#9CA3AF" />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
              Tuesday, 14 July, 2026
            </Typography>
          </Box>
        </Box>

        {/* Right Header Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {selectedDoctor && (
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => setSelectedDoctor(null)}
              sx={{
                borderRadius: "20px",
                borderColor: "#D5E8ED",
                color: "#045E6A",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                "&:hover": { borderColor: "#2EBBD9", backgroundColor: "#E6F8FA" },
              }}
            >
              Back to Staff List
            </Button>
          )}

          {/* Search Doctor Input */}
          <TextField
            size="small"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search size={16} color="#9CA3AF" style={{ marginRight: 6 }} />,
                sx: { borderRadius: "20px", backgroundColor: "#FFFFFF", fontSize: "0.88rem", height: 38 },
              },
            }}
          />

          {/* All Status Dropdown Filter */}
          <Button
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            endIcon={<ChevronDown size={16} />}
            sx={{
              backgroundColor: "#E6F8FA",
              color: "#045E6A",
              borderRadius: "20px",
              px: 2.2,
              py: 0.8,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              border: "1px solid #C4EEF5",
              "&:hover": { backgroundColor: "#D5F5FA" },
            }}
          >
            {statusFilter === "All" ? "All Status" : statusFilter}
          </Button>

          <Menu
            anchorEl={statusAnchor}
            open={Boolean(statusAnchor)}
            onClose={() => setStatusAnchor(null)}
            slotProps={{ paper: { sx: { borderRadius: "14px", mt: 1, minWidth: 140 } } }}
          >
            <MenuItem onClick={() => { setStatusFilter("All"); setStatusAnchor(null); }}>All Status</MenuItem>
            <MenuItem onClick={() => { setStatusFilter("Available"); setStatusAnchor(null); }}>Available Only</MenuItem>
            <MenuItem onClick={() => { setStatusFilter("Unavailable"); setStatusAnchor(null); }}>Unavailable Only</MenuItem>
          </Menu>

          {/* Add New Doctor Button */}
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setAddDoctorOpen(true)}
            sx={{
              backgroundColor: "#2EBBD9",
              color: "#FFFFFF",
              borderRadius: "20px",
              px: 2.5,
              py: 0.8,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              boxShadow: "0 4px 14px rgba(46, 187, 217, 0.3)",
              "&:hover": { backgroundColor: "#20A5C2" },
            }}
          >
            Add New Doctor
          </Button>
        </Box>
      </Box>

      {/* ======================================================
          VIEW A: STAFF DOCTORS LIST GRID (IMAGE 1)
      ====================================================== */}
      {!selectedDoctor && (
        <>
          {/* Category Filter Pills Row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5, overflowX: "auto", pb: 1 }}>
            {[
              { id: "All", label: "All" },
              { id: "General Dentist", label: "General Dentist" },
              { id: "Pediatric", label: "Pediatric" },
              { id: "Orthodontist", label: "Orthodontist" },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as "All" | "General Dentist" | "Pediatric" | "Orthodontist")}
                  sx={{
                    borderRadius: "12px",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    whiteSpace: "nowrap",
                    backgroundColor: active ? "#2EBBD9" : "#DDF4F8",
                    color: active ? "#FFFFFF" : "#045E6A",
                    boxShadow: active ? "0 4px 12px rgba(46, 187, 217, 0.25)" : "none",
                    "&:hover": {
                      backgroundColor: active ? "#20A5C2" : "#C4EEF5",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          {/* Doctor Cards Grid (4 Columns) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filteredDoctors.map((doc) => (
              <Paper
                key={doc.id}
                elevation={0}
                onClick={() => setSelectedDoctor(doc)}
                sx={{
                  borderRadius: "20px",
                  p: 2.2,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2EDF2",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 28px rgba(46, 187, 217, 0.15)",
                    borderColor: "#2EBBD9",
                  },
                }}
              >
                {/* Card Top Banner: Doctor Photo + Three Dots + Schedule Badge */}
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      borderRadius: "16px",
                      overflow: "hidden",
                      backgroundColor: "#F1F5F9",
                    }}
                  >
                    <Box
                      component="img"
                      src={doc.avatar}
                      alt={doc.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center top",
                      }}
                    />
                  </Box>

                  {/* Three Dots Menu Icon */}
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); }}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(4px)",
                      color: "#4B5563",
                      "&:hover": { backgroundColor: "#FFFFFF" },
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </IconButton>

                  {/* Schedule Badge Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(6px)",
                      px: 1.2,
                      py: 0.5,
                      borderRadius: "10px",
                      textAlign: "center",
                      border: "1px solid rgba(255,255,255,0.6)",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "#111827", display: "block", fontSize: "0.72rem", lineHeight: 1.1 }}>
                      {doc.schedule}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.65rem" }}>
                      ({doc.scheduleHours})
                    </Typography>
                  </Box>
                </Box>

                {/* Doctor Info Footer */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.05rem", lineHeight: 1.2, mb: 0.5 }}>
                      {doc.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.8rem" }}>
                        {doc.specialist}
                      </Typography>

                      {/* Status Badge */}
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          backgroundColor: doc.status === "Available" ? "#2EBBD9" : "#EF4444",
                          color: "#FFFFFF",
                          borderRadius: "10px",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Phone Call Icon Button */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Calling ${doc.name} at ${doc.phone}`);
                    }}
                    sx={{
                      backgroundColor: "#DDF4F8",
                      color: "#045E6A",
                      width: 38,
                      height: 38,
                      borderRadius: "12px",
                      "&:hover": { backgroundColor: "#2EBBD9", color: "#FFFFFF" },
                    }}
                  >
                    <Phone size={18} />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>

          {filteredDoctors.length === 0 && (
            <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "20px", backgroundColor: "#FFFFFF" }}>
              <Typography variant="h6" sx={{ color: "#6B7280", fontWeight: 600 }}>
                No staff members found matching your search.
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* ======================================================
          VIEW B: DOCTOR DETAILS VIEW (IMAGE 2)
      ====================================================== */}
      {selectedDoctor && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Top Counter Metrics (400 Total Appointment / 350 Total Patient) */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CalendarCheck size={28} color="#2EBBD9" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  {selectedDoctor.totalAppointments}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                  Total Appointment
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Users size={28} color="#2EBBD9" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  {selectedDoctor.totalPatients}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600 }}>
                  Total Patient
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Content Layout Grid: Left Profile Card vs Right Patients & Feedback */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" }, gap: 3 }}>
            {/* LEFT COLUMN: Doctor Profile Card & Appointment Schedule */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Profile Overview Card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  p: 3,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2EDF2",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* Large Portrait Photo */}
                <Box
                  sx={{
                    width: "100%",
                    height: 260,
                    borderRadius: "20px",
                    overflow: "hidden",
                    backgroundColor: "#E2EDF2",
                    mb: 2.5,
                  }}
                >
                  <Box
                    component="img"
                    src={selectedDoctor.avatar}
                    alt={selectedDoctor.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                {/* Doctor Code Badge */}
                <Chip
                  label={selectedDoctor.doctorCode}
                  size="small"
                  sx={{
                    backgroundColor: "#7DE2F0",
                    color: "#004552",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    borderRadius: "10px",
                    mb: 1,
                  }}
                />

                <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mb: 2 }}>
                  {selectedDoctor.name}
                </Typography>

                {/* Profile Key Value Table */}
                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5, textAlign: "left" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Specialist</Typography>
                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 700 }}>{selectedDoctor.specialist}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Experience</Typography>
                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 700 }}>{selectedDoctor.experience}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Contact</Typography>
                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 700 }}>{selectedDoctor.phone}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Email</Typography>
                    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 700 }}>{selectedDoctor.email}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>Status</Typography>
                    <Chip
                      label={selectedDoctor.status}
                      size="small"
                      sx={{
                        height: 22,
                        backgroundColor: selectedDoctor.status === "Available" ? "#2EBBD9" : "#EF4444",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>

                  {/* Consultation Slot */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px dashed #E2EDF2" }}>
                    <Typography variant="body2" sx={{ color: "#045E6A", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Clock size={16} /> Consultation Slot
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#2EBBD9", fontWeight: 800 }}>
                      30 Mins / Patient
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Appointment Schedule Carousel Box */}
              <Paper elevation={0} sx={{ borderRadius: "24px", p: 3, backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.1rem" }}>
                    Apointment Schedule
                  </Typography>
                  <IconButton size="small"><MoreHorizontal size={18} /></IconButton>
                </Box>

                {/* Day Selection Carousel */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <IconButton size="small" sx={{ color: "#6B7280", p: 0.5 }}>
                    <ChevronLeft size={18} />
                  </IconButton>

                  {[
                    { day: 12, name: "Sun" },
                    { day: 13, name: "Mon" },
                    { day: 14, name: "Tue" },
                    { day: 15, name: "Wed" },
                    { day: 16, name: "Thu" },
                  ].map((item) => {
                    const isSel = selectedScheduleDay === item.day;
                    return (
                      <Box
                        key={item.day}
                        onClick={() => setSelectedScheduleDay(item.day)}
                        sx={{
                          p: 1,
                          borderRadius: "12px",
                          textAlign: "center",
                          cursor: "pointer",
                          minWidth: 42,
                          backgroundColor: isSel ? "#E6F8FA" : "transparent",
                          border: isSel ? "1.5px solid #2EBBD9" : "1px solid transparent",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 800, color: isSel ? "#00ADC6" : "#111827", fontSize: "1rem", lineHeight: 1 }}>
                          {item.day}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isSel ? "#00ADC6" : "#9CA3AF", fontSize: "0.72rem", fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      </Box>
                    );
                  })}

                  <IconButton size="small" sx={{ color: "#6B7280", p: 0.5 }}>
                    <ChevronRight size={18} />
                  </IconButton>
                </Box>

                {/* Time Slots Pills Grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
                  {["(09:30–16:30)", "(10:30–14:30)", "(08:30–16:30)", "(11:30–13:30)", "(10:00–16:30)", "(14:30–18:30)"].map((slot, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      sx={{
                        borderRadius: "16px",
                        py: 0.8,
                        borderColor: "#7DE2F0",
                        color: "#004552",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#E6F8FA", borderColor: "#2EBBD9" },
                      }}
                    >
                      {slot}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* RIGHT COLUMN: Patients List Table & Feedback */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Patients List Card & Table */}
              <Paper elevation={0} sx={{ borderRadius: "24px", p: 3, backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.2rem" }}>
                    Patients List
                  </Typography>

                  <Button
                    onClick={(e) => setPatientTimeframeAnchor(e.currentTarget)}
                    endIcon={<ChevronDown size={16} />}
                    sx={{
                      backgroundColor: "#045E6A",
                      color: "#FFFFFF",
                      borderRadius: "20px",
                      px: 2.2,
                      py: 0.6,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      "&:hover": { backgroundColor: "#034953" },
                    }}
                  >
                    {patientTimeframe}
                  </Button>

                  <Menu
                    anchorEl={patientTimeframeAnchor}
                    open={Boolean(patientTimeframeAnchor)}
                    onClose={() => setPatientTimeframeAnchor(null)}
                    slotProps={{ paper: { sx: { borderRadius: "12px", mt: 1, minWidth: 120 } } }}
                  >
                    <MenuItem onClick={() => { setPatientTimeframe("Weekly"); setPatientTimeframeAnchor(null); }}>Weekly</MenuItem>
                    <MenuItem onClick={() => { setPatientTimeframe("Monthly"); setPatientTimeframeAnchor(null); }}>Monthly</MenuItem>
                    <MenuItem onClick={() => { setPatientTimeframe("Yearly"); setPatientTimeframeAnchor(null); }}>Yearly</MenuItem>
                  </Menu>
                </Box>

                {/* Cyan Header Patients Table */}
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#00ADC6" }}>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", py: 1.5 }}>Patient Name</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Age</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Gender</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Condition</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Doctor</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Admission Date</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {MOCK_PATIENTS_LIST.map((pat) => (
                        <TableRow key={pat.id} hover sx={{ "&:hover": { backgroundColor: "#F7FCFD" } }}>
                          <TableCell sx={{ fontWeight: 600, color: "#1F2937", fontSize: "0.88rem" }}>{pat.name}</TableCell>
                          <TableCell sx={{ color: "#4B5563", fontSize: "0.85rem" }}>{pat.age}</TableCell>
                          <TableCell sx={{ color: "#4B5563", fontSize: "0.85rem" }}>{pat.gender}</TableCell>
                          <TableCell sx={{ color: "#4B5563", fontSize: "0.85rem" }}>{pat.condition}</TableCell>
                          <TableCell sx={{ color: "#4B5563", fontSize: "0.85rem" }}>{pat.doctorName}</TableCell>
                          <TableCell sx={{ color: "#6B7280", fontSize: "0.82rem" }}>{pat.admissionDate}</TableCell>
                          <TableCell>
                            <Chip
                              label={pat.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                borderRadius: "8px",
                                backgroundColor:
                                  pat.status === "Admitted"
                                    ? "#98ECF8"
                                    : pat.status === "In-Treatment"
                                    ? "#A7F3D0"
                                    : "#FCA5A5",
                                color:
                                  pat.status === "Admitted"
                                    ? "#045E6A"
                                    : pat.status === "In-Treatment"
                                    ? "#065F46"
                                    : "#991B1B",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Feedback Review Cards */}
              <Paper elevation={0} sx={{ borderRadius: "24px", p: 3, backgroundColor: "#FFFFFF", border: "1px solid #E2EDF2" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.2rem" }}>
                    Feedback
                  </Typography>
                  <IconButton size="small"><MoreHorizontal size={18} /></IconButton>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
                  {MOCK_FEEDBACK.map((fb) => (
                    <Paper
                      key={fb.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        backgroundColor: "#E6F8FA",
                        border: "1px solid #C4EEF5",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
                          {fb.patientName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.3, display: "block" }}>
                          {fb.comment}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                          {fb.date}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Star size={14} fill="#EAB308" color="#EAB308" />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: "#111827" }}>
                            {fb.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* ======================================================
          MODAL: ADD NEW DOCTOR DIALOG
      ====================================================== */}
      <Dialog
        open={addDoctorOpen}
        onClose={() => setAddDoctorOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              backgroundColor: "#242E42",
              color: "#FFFFFF",
              p: 1.5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              border: "1px solid #334155",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.4rem", pt: 1, pb: 1.5 }}>
          Add New Staff Doctor
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.2, pt: 1 }}>
          {/* File Upload Input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {/* Doctor Image Upload Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              backgroundColor: "#1A2333",
              border: "1.5px dashed #2EBBD9",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              position: "relative",
              transition: "all 0.2s ease-in-out",
              "&:hover": { borderColor: "#7DE2F0", backgroundColor: "#1D273A" },
            }}
          >
            {imagePreviewUrl ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={imagePreviewUrl}
                    alt="Uploaded Preview"
                    sx={{ width: 84, height: 84, border: "3px solid #2EBBD9", boxShadow: "0 8px 16px rgba(0,0,0,0.4)" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setImagePreviewUrl("")}
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: "#EF4444",
                      color: "#FFFFFF",
                      "&:hover": { backgroundColor: "#DC2626" },
                      p: "4px",
                    }}
                  >
                    <X size={14} />
                  </IconButton>
                </Box>
                <Typography variant="caption" sx={{ color: "#7DE2F0", fontWeight: 700 }}>
                  Photo uploaded successfully!
                </Typography>
                <Button
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: "#2EBBD9", fontSize: "0.75rem", textTransform: "none", textDecoration: "underline" }}
                >
                  Change Photo
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 54,
                      height: 54,
                      backgroundColor: "#243247",
                      color: "#2EBBD9",
                      border: "1px solid #33435C",
                    }}
                  >
                    <Camera size={26} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                      Upload Doctor Photo
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      Supports PNG, JPG or WEBP (Max 5MB)
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadCloud size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderColor: "#2EBBD9",
                    color: "#2EBBD9",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    "&:hover": { borderColor: "#7DE2F0", backgroundColor: "rgba(46, 187, 217, 0.1)" },
                  }}
                >
                  Browse Image File
                </Button>

                {/* Preset Doctor Photos */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.72rem" }}>
                    Or select sample:
                  </Typography>
                  {[
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1594824813566-88855ce78907?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                  ].map((preset, index) => (
                    <Avatar
                      key={index}
                      src={preset}
                      onClick={() => setImagePreviewUrl(preset)}
                      sx={{
                        width: 30,
                        height: 30,
                        cursor: "pointer",
                        border: "2px solid transparent",
                        "&:hover": { border: "2px solid #2EBBD9", transform: "scale(1.1)" },
                        transition: "all 0.15s ease",
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>

          <TextField
            label="Doctor Name"
            fullWidth
            value={newDocData.name}
            onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
            placeholder="e.g. Dr. Robert Vance"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                backgroundColor: "#1D2739",
                borderRadius: "12px",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#2EBBD9" },
                "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
              },
              "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
            }}
          />

          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                backgroundColor: "#1D2739",
                borderRadius: "12px",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#2EBBD9" },
                "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
              },
              "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
              "& .MuiSelect-icon": { color: "#2EBBD9" },
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={newDocData.category}
              label="Category"
              onChange={(e) => setNewDocData({ ...newDocData, category: e.target.value as "General Dentist" | "Pediatric" | "Orthodontist" })}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      backgroundColor: "#1D2739",
                      color: "#FFFFFF",
                      border: "1px solid #334155",
                      "& .MuiMenuItem-root:hover": { backgroundColor: "#2A364F" },
                      "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#2EBBD9", color: "#FFFFFF" },
                    },
                  },
                },
              }}
            >
              <MenuItem value="General Dentist">General Dentist</MenuItem>
              <MenuItem value="Pediatric">Pediatric</MenuItem>
              <MenuItem value="Orthodontist">Orthodontist</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Specialist Title"
            fullWidth
            value={newDocData.specialist}
            onChange={(e) => setNewDocData({ ...newDocData, specialist: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFFFFF",
                backgroundColor: "#1D2739",
                borderRadius: "12px",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#2EBBD9" },
                "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
              },
              "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
            }}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Schedule Days"
              value={newDocData.schedule}
              onChange={(e) => setNewDocData({ ...newDocData, schedule: e.target.value })}
              placeholder="Mon–Fri"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "#1D2739",
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#2EBBD9" },
                  "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
                },
                "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
              }}
            />
            <TextField
              label="Schedule Hours"
              value={newDocData.scheduleHours}
              onChange={(e) => setNewDocData({ ...newDocData, scheduleHours: e.target.value })}
              placeholder="08:30–16:30"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "#1D2739",
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#2EBBD9" },
                  "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
                },
                "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
              }}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Phone Number"
              value={newDocData.phone}
              onChange={(e) => setNewDocData({ ...newDocData, phone: e.target.value })}
              placeholder="(+2) 012 345 678"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "#1D2739",
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "#334155" },
                  "&:hover fieldset": { borderColor: "#2EBBD9" },
                  "&.Mui-focused fieldset": { borderColor: "#2EBBD9" },
                },
                "& .MuiInputLabel-root": { color: "#2EBBD9", fontWeight: 600 },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2EBBD9" },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => setAddDoctorOpen(false)}
            sx={{ color: "#94A3B8", fontWeight: 700, px: 2, "&:hover": { color: "#FFFFFF" } }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDoctorSubmit}
            sx={{
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              borderRadius: "14px",
              fontWeight: 800,
              px: 3.5,
              py: 1.1,
              fontSize: "0.95rem",
              textTransform: "none",
              boxShadow: "0 8px 20px rgba(124, 58, 237, 0.4)",
              "&:hover": { backgroundColor: "#6D28D9" },
            }}
          >
            Save Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStaffPage;
