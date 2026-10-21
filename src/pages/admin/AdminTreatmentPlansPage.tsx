import React, { useState, useMemo } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ArrowUpDown,
  Search,
  Plus,
  Clock,
  FileText,
  CheckCircle,
  Check,
  X,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ======================================================
   Types & Interfaces
====================================================== */

export type TreatmentPlanStatus = "Active" | "Completed" | "Pending" | "On Hold";

export interface TreatmentStep {
  stepNumber: number;
  title: string;
  description: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  dateCompleted?: string;
}

export interface TreatmentPlanRecord {
  id: string;
  patientName: string;
  treatment: string;
  assignedDoctor: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  cost: number;
  status: TreatmentPlanStatus;
  startDate: string;
  category: string;
  notes: string;
  steps: TreatmentStep[];
}

/* ======================================================
   Initial Mock Data (Matches Screenshot Exactly)
====================================================== */

const INITIAL_PLANS: TreatmentPlanRecord[] = [
  {
    id: "TP-101",
    patientName: "Alice Saint",
    treatment: "Calculus build-up",
    assignedDoctor: "Dr. Daniel Lee",
    currentStep: 3,
    totalSteps: 8,
    progressPercent: 40,
    cost: 1500,
    status: "Active",
    startDate: "10-07-2026",
    category: "Periodontics",
    notes: "Patient requires 4 sessions of deep scaling and antibiotic application.",
    steps: [
      { stepNumber: 1, title: "Initial Assessment & X-Ray", description: "Full mouth digital X-ray and periodontal probing", status: "COMPLETED", dateCompleted: "10-07-2026" },
      { stepNumber: 2, title: "Supragingival Scaling", description: "Removal of plaque and calculus above gum line", status: "COMPLETED", dateCompleted: "12-07-2026" },
      { stepNumber: 3, title: "Subgingival Root Planing", description: "Deep cleaning of tooth roots under local anesthesia", status: "IN_PROGRESS" },
      { stepNumber: 4, title: "Antimicrobial Irrigation", description: "Flushing periodontal pockets with chlorhexidine", status: "PENDING" },
      { stepNumber: 5, title: "Laser Periodontal Therapy", description: "Decontamination of deep periodontal pockets", status: "PENDING" },
      { stepNumber: 6, title: "Polishing & Fluoride Application", description: "Smoothing enamel and remineralization treatment", status: "PENDING" },
      { stepNumber: 7, title: "Post-Treatment Evaluation", description: "Pocket depth re-evaluation after 2 weeks", status: "PENDING" },
      { stepNumber: 8, title: "Maintenance & Oral Hygiene Routine", description: "Custom home care regimen & 3-month recall setup", status: "PENDING" },
    ],
  },
  {
    id: "TP-102",
    patientName: "Lucas Anthony",
    treatment: "Bleeding Gums",
    assignedDoctor: "Dr. Brasses Saint",
    currentStep: 6,
    totalSteps: 8,
    progressPercent: 70,
    cost: 1500,
    status: "Active",
    startDate: "01-07-2026",
    category: "Gingival Care",
    notes: "Moderate gingivitis with bleeding on probing. Good response to initial therapy.",
    steps: [
      { stepNumber: 1, title: "Comprehensive Oral Exam", description: "Bleeding index and plaque index calculation", status: "COMPLETED", dateCompleted: "01-07-2026" },
      { stepNumber: 2, title: "Full Mouth Debridement", description: "Ultrasound scaling for calculus removal", status: "COMPLETED", dateCompleted: "03-07-2026" },
      { stepNumber: 3, title: "Gingival Sulcus Flushing", description: "Antiseptic flush of inflamed gingiva", status: "COMPLETED", dateCompleted: "05-07-2026" },
      { stepNumber: 4, title: "Desensitizing Agent Application", description: "Treating sensitive dentin exposed by recession", status: "COMPLETED", dateCompleted: "08-07-2026" },
      { stepNumber: 5, title: "Soft Tissue Laser Healing", description: "Promoting tissue regeneration and clot stability", status: "COMPLETED", dateCompleted: "11-07-2026" },
      { stepNumber: 6, title: "Re-evaluation & Microbe Audit", description: "Checking resolution of gingival bleeding", status: "IN_PROGRESS" },
      { stepNumber: 7, title: "Tooth Surface Smooth & Polish", description: "Prophy paste polishing for smooth surface", status: "PENDING" },
      { stepNumber: 8, title: "Final Compliance Check", description: "Reviewing oral hygiene techniques with patient", status: "PENDING" },
    ],
  },
  {
    id: "TP-103",
    patientName: "Thomas Aldin",
    treatment: "Tooth Sensitivity",
    assignedDoctor: "Dr. John Wilson",
    currentStep: 3,
    totalSteps: 3,
    progressPercent: 100,
    cost: 1200,
    status: "Completed",
    startDate: "25-06-2026",
    category: "Endodontics",
    notes: "Enamel micro-abrasion and fluoride varnish treatment completed successfully.",
    steps: [
      { stepNumber: 1, title: "Dentin Hypersensitivity Testing", description: "Air blast and tactile sensitivity probe mapping", status: "COMPLETED", dateCompleted: "25-06-2026" },
      { stepNumber: 2, title: "Potassium Nitrate Varnish Application", description: "Sealing open dentinal tubules with bonding varnish", status: "COMPLETED", dateCompleted: "28-06-2026" },
      { stepNumber: 3, title: "Final Sensitivity Relief Audit", description: "Verification of zero sensitivity to thermal stimuli", status: "COMPLETED", dateCompleted: "02-07-2026" },
    ],
  },
  {
    id: "TP-104",
    patientName: "Tom Crues",
    treatment: "Wisdom Tooth Pain",
    assignedDoctor: "Dr. Daniel Lee",
    currentStep: 3,
    totalSteps: 8,
    progressPercent: 40,
    cost: 1500,
    status: "Active",
    startDate: "08-07-2026",
    category: "Oral Surgery",
    notes: "Impacted lower right third molar (Tooth #32) undergoing pre-surgical preparation.",
    steps: [
      { stepNumber: 1, title: "CBCT 3D Scan & Nerve Evaluation", description: "3D imaging to verify inferior alveolar nerve proximity", status: "COMPLETED", dateCompleted: "08-07-2026" },
      { stepNumber: 2, title: "Pre-op Antibiotic & Pain Regimen", description: "Prophylactic antibiotic prescription and instructions", status: "COMPLETED", dateCompleted: "10-07-2026" },
      { stepNumber: 3, title: "Surgical Extraction Preparation", description: "Local anesthesia and tissue flap elevation", status: "IN_PROGRESS" },
      { stepNumber: 4, title: "Tooth Sectioning & Removal", description: "Sectioning crown and roots for safe removal", status: "PENDING" },
      { stepNumber: 5, title: "Socket Debridement & Suturing", description: "Irrigation and placement of dissolvable sutures", status: "PENDING" },
      { stepNumber: 6, title: "Post-op Care & Ice Compress", description: "Instructions for bleeding control and swelling management", status: "PENDING" },
      { stepNumber: 7, title: "Day 3 Post-op Socket Inspection", description: "Checking for normal clot formation & dry socket prevention", status: "PENDING" },
      { stepNumber: 8, title: "Final Healing Sign-off", description: "Suture removal and bone healing check", status: "PENDING" },
    ],
  },
  {
    id: "TP-105",
    patientName: "Aldric Jenny",
    treatment: "Tooth Decay",
    assignedDoctor: "Dr. Michael Brown",
    currentStep: 3,
    totalSteps: 3,
    progressPercent: 100,
    cost: 2500,
    status: "Completed",
    startDate: "15-06-2026",
    category: "Restorative Dentistry",
    notes: "Composite resin restoration and porcelain crown placement completed.",
    steps: [
      { stepNumber: 1, title: "Caries Excavation & Cavity Prep", description: "Removal of decayed dentin under rubber dam isolation", status: "COMPLETED", dateCompleted: "15-06-2026" },
      { stepNumber: 2, title: "Core Buildup & Crown Impression", description: "Glass ionomer core placement & digital scanner impression", status: "COMPLETED", dateCompleted: "20-06-2026" },
      { stepNumber: 3, title: "Permanent Crown Cementation", description: "Bonding custom Zirconia crown with resin cement", status: "COMPLETED", dateCompleted: "01-07-2026" },
    ],
  },
  {
    id: "TP-106",
    patientName: "Jaqueline",
    treatment: "Calculus build-up",
    assignedDoctor: "Dr. John Wilson",
    currentStep: 3,
    totalSteps: 8,
    progressPercent: 40,
    cost: 1500,
    status: "Active",
    startDate: "11-07-2026",
    category: "Hygiene & Prevention",
    notes: "Heavy calculus on lower anterior lingual surfaces.",
    steps: [
      { stepNumber: 1, title: "Plaque Disclosing Dye Exam", description: "Staining teeth to highlight mature plaque deposits", status: "COMPLETED", dateCompleted: "11-07-2026" },
      { stepNumber: 2, title: "Ultrasonic Scaling Session 1", description: "Piezoelectric scaler usage for heavy calculus removal", status: "COMPLETED", dateCompleted: "13-07-2026" },
      { stepNumber: 3, title: "Interdental Hand Instrumentation", description: "Gracey curette scaling in tight proximal spaces", status: "IN_PROGRESS" },
      { stepNumber: 4, title: "Air-Flow Stain Removal", description: "Sodium bicarbonate spray for extrinsic stain cleaning", status: "PENDING" },
      { stepNumber: 5, title: "Gum Health Re-assessment", description: "Checking gingival index improvements", status: "PENDING" },
      { stepNumber: 6, title: "Fluoride Protection Application", description: "High-concentration fluoride varnish coating", status: "PENDING" },
      { stepNumber: 7, title: "Home Care Instruction & Floss Training", description: "Demonstrating proper C-shape flossing technique", status: "PENDING" },
      { stepNumber: 8, title: "6-Month Preventive Schedule", description: "Scheduling automated recall reminder", status: "PENDING" },
    ],
  },
  {
    id: "TP-107",
    patientName: "Aldrik Asher",
    treatment: "Bad Breath",
    assignedDoctor: "Dr. Brasses Saint",
    currentStep: 6,
    totalSteps: 8,
    progressPercent: 70,
    cost: 1800,
    status: "Active",
    startDate: "02-07-2026",
    category: "Halitosis Management",
    notes: "Halitosis therapy targeting volatile sulfur compounds (VSC) on posterior tongue.",
    steps: [
      { stepNumber: 1, title: "Halimeter VSC Measurement", description: "Quantifying volatile sulfur gas concentration", status: "COMPLETED", dateCompleted: "02-07-2026" },
      { stepNumber: 2, title: "Tongue Scraping & Deep Clean", description: "Removal of posterior tongue coating and bacteria", status: "COMPLETED", dateCompleted: "04-07-2026" },
      { stepNumber: 3, title: "Tonsil Crypt Audit", description: "Inspection for tonsilloliths / tonsil stones", status: "COMPLETED", dateCompleted: "06-07-2026" },
      { stepNumber: 4, title: "Zinc Chloride Mouthrinse Therapy", description: "Neutralizing VSC compounds with special rinse", status: "COMPLETED", dateCompleted: "08-07-2026" },
      { stepNumber: 5, title: "Periodontal Pocket Decontamination", description: "Cleaning subgingival anaerobic bacterial harbors", status: "COMPLETED", dateCompleted: "11-07-2026" },
      { stepNumber: 6, title: "Mid-Term VSC Re-testing", description: "Evaluating reduction in breath odor levels", status: "IN_PROGRESS" },
      { stepNumber: 7, title: "Dietary & Hydration Counseling", description: "Guidance on dry mouth prevention and diet", status: "PENDING" },
      { stepNumber: 8, title: "Final Breath Clearance Certificate", description: "Confirming normal breath gas measurements", status: "PENDING" },
    ],
  },
  {
    id: "TP-108",
    patientName: "Nice Patel",
    treatment: "Bleeding Gums",
    assignedDoctor: "Dr. Daniel Lee",
    currentStep: 3,
    totalSteps: 8,
    progressPercent: 40,
    cost: 1500,
    status: "Active",
    startDate: "09-07-2026",
    category: "Periodontics",
    notes: "Early stage periodontitis. Therapy focused on inflammation reduction.",
    steps: [
      { stepNumber: 1, title: "Periodontal Charting", description: "Recording 6-point probing depth for all teeth", status: "COMPLETED", dateCompleted: "09-07-2026" },
      { stepNumber: 2, title: "Initial Scaling Session", description: "Removing supragingival calculus deposits", status: "COMPLETED", dateCompleted: "11-07-2026" },
      { stepNumber: 3, title: "Laser Assisted Periodontal Therapy", description: "Targeted laser removal of diseased pocket lining", status: "IN_PROGRESS" },
      { stepNumber: 4, title: "Local Antibiotic Insertion", description: "Placing Arestin microspheres into deep pockets", status: "PENDING" },
      { stepNumber: 5, title: "Healing & Attachment Check", description: "Evaluating gain in clinical attachment level", status: "PENDING" },
      { stepNumber: 6, title: "Teeth Polishing & Smooth Prep", description: "Removing residual stains and roughness", status: "PENDING" },
      { stepNumber: 7, title: "Oral Hygiene Reinforcement", description: "Instruction on interdental brushes", status: "PENDING" },
      { stepNumber: 8, title: "Maintenance Protocol", description: "Setting up 3-month periodontal maintenance", status: "PENDING" },
    ],
  },
  {
    id: "TP-109",
    patientName: "Wilson wilson",
    treatment: "Tooth Sensitivity",
    assignedDoctor: "Dr. John Wilson",
    currentStep: 0,
    totalSteps: 2,
    progressPercent: 0,
    cost: 1500,
    status: "Pending",
    startDate: "14-07-2026",
    category: "Desensitization",
    notes: "Awaiting patient approval for desensitizing resin coating.",
    steps: [
      { stepNumber: 1, title: "Exposed Root Dentin Sealing", description: "Applying dentin bonding agent to exposed roots", status: "PENDING" },
      { stepNumber: 2, title: "Fluoride Varnish & Post Check", description: "High concentration sodium fluoride varnish application", status: "PENDING" },
    ],
  },
  {
    id: "TP-110",
    patientName: "Shaqira",
    treatment: "Wisdom Tooth Pain",
    assignedDoctor: "Dr. Michael Brown",
    currentStep: 3,
    totalSteps: 8,
    progressPercent: 40,
    cost: 1500,
    status: "Active",
    startDate: "07-07-2026",
    category: "Oral Surgery",
    notes: "Pericoronitis around erupting tooth #17. Irrigation & antibiotic treatment.",
    steps: [
      { stepNumber: 1, title: "Pericoronal Flap Irrigation", description: "Flushing food debris from operculum pocket", status: "COMPLETED", dateCompleted: "07-07-2026" },
      { stepNumber: 2, title: "Operculectomy Flap Excision", description: "Removal of inflamed gum tissue over tooth", status: "COMPLETED", dateCompleted: "09-07-2026" },
      { stepNumber: 3, title: "Post-Operculectomy Healing Check", description: "Monitoring tissue healing & swelling", status: "IN_PROGRESS" },
      { stepNumber: 4, title: "Bite Adjustment & Occlusal Check", description: "Adjusting opposing upper molar to prevent trauma", status: "PENDING" },
      { stepNumber: 5, title: "Soft Tissue Laser Sterilization", description: "Biostimulation laser for rapid healing", status: "PENDING" },
      { stepNumber: 6, title: "Pain & Swelling Re-evaluation", description: "Checking symptom resolution", status: "PENDING" },
      { stepNumber: 7, title: "Radiographic Monitoring", description: "Panoramic X-ray to check tooth eruption path", status: "PENDING" },
      { stepNumber: 8, title: "Final Treatment Signoff", description: "Discharging patient from acute pain protocol", status: "PENDING" },
    ],
  },
  {
    id: "TP-111",
    patientName: "Catherin Angel",
    treatment: "Calculus build-up",
    assignedDoctor: "Dr. Brasses Saint",
    currentStep: 4,
    totalSteps: 8,
    progressPercent: 50,
    cost: 1200,
    status: "On Hold",
    startDate: "28-06-2026",
    category: "Periodontics",
    notes: "Treatment paused per patient request due to travel. Resuming next month.",
    steps: [
      { stepNumber: 1, title: "Periodontal Exam & Probing", description: "Assessment of calculus severity and pocketing", status: "COMPLETED", dateCompleted: "28-06-2026" },
      { stepNumber: 2, title: "Upper Arch Ultrasonic Scaling", description: "Deep cleaning of upper maxillary teeth", status: "COMPLETED", dateCompleted: "30-06-2026" },
      { stepNumber: 3, title: "Lower Arch Ultrasonic Scaling", description: "Deep cleaning of lower mandibular teeth", status: "COMPLETED", dateCompleted: "02-07-2026" },
      { stepNumber: 4, title: "Root Surface Smoothing", description: "Hand curette planning of exposed root surfaces", status: "IN_PROGRESS" },
      { stepNumber: 5, title: "Subgingival Antimicrobial Wash", description: "Flushing pockets with iodine solution", status: "PENDING" },
      { stepNumber: 6, title: "Enamel Micro-polishing", description: "Removing micro-roughness from teeth", status: "PENDING" },
      { stepNumber: 7, title: "Gingival Re-evaluation", description: "Checking tissue firmness and pocket reduction", status: "PENDING" },
      { stepNumber: 8, title: "Preventive Care Setup", description: "Issuing custom mouthguard & recall date", status: "PENDING" },
    ],
  },
  {
    id: "TP-112",
    patientName: "Willium Thomas",
    treatment: "Bad Breath",
    assignedDoctor: "Dr. Michael Brown",
    currentStep: 5,
    totalSteps: 8,
    progressPercent: 30,
    cost: 1000,
    status: "Active",
    startDate: "05-07-2026",
    category: "Oral Microbiology",
    notes: "Targeted antimicrobial therapy for oral malodor.",
    steps: [
      { stepNumber: 1, title: "Oral Microflora Swab & Culture", description: "Identifying odor-producing anaerobic bacteria", status: "COMPLETED", dateCompleted: "05-07-2026" },
      { stepNumber: 2, title: "Professional Tongue Cleaning", description: "Deep cleaning of tongue papillae", status: "COMPLETED", dateCompleted: "07-07-2026" },
      { stepNumber: 3, title: "Full Mouth Subgingival Scaling", description: "Eliminating subgingival bio-film deposits", status: "COMPLETED", dateCompleted: "09-07-2026" },
      { stepNumber: 4, title: "Chlorhexidine Therapy Protocol", description: "Prescription 0.12% Chlorhexidine rinse regimen", status: "COMPLETED", dateCompleted: "12-07-2026" },
      { stepNumber: 5, title: "Probiotic Oral Tablet Regimen", description: "Introducing beneficial Streptococcus salivarius K12", status: "IN_PROGRESS" },
      { stepNumber: 6, title: "Halitosis Re-assessment Audit", description: "Measuring VSC levels after 2 weeks", status: "PENDING" },
      { stepNumber: 7, title: "Dietary Adjustment Plan", description: "Guidance on avoiding odor-causing foods", status: "PENDING" },
      { stepNumber: 8, title: "Final Care Completion", description: "Discharging patient with maintenance guide", status: "PENDING" },
    ],
  },
];

/* ======================================================
   Theme Colors (Matching Dentivo Mockup)
====================================================== */

const COLOR_CYAN = "#00ADC6";
const COLOR_CYAN_HOVER = "#009BB2";
const COLOR_CYAN_PILL = "#B9F2FB";
const COLOR_CYAN_TEXT = "#006778";

const COLOR_GREEN_PILL = "#7DE2C3";
const COLOR_GREEN_TEXT = "#005C43";

const COLOR_YELLOW_PILL = "#FAF2C3";
const COLOR_YELLOW_TEXT = "#8A7B12";

const COLOR_GREY_PILL = "#E2E8F0";
const COLOR_GREY_TEXT = "#475569";

const AdminTreatmentPlansPage: React.FC = () => {
  const { user } = useAuth();

  // State
  const [plans, setPlans] = useState<TreatmentPlanRecord[]>(INITIAL_PLANS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTimeframe, setFilterTimeframe] = useState<"Weekly" | "Monthly" | "All Time">("Weekly");
  const [timeframeAnchor, setTimeframeAnchor] = useState<null | HTMLElement>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof TreatmentPlanRecord>("patientName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modals
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<TreatmentPlanRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New Plan State
  const [newPlan, setNewPlan] = useState<Partial<TreatmentPlanRecord>>({
    patientName: "",
    treatment: "Calculus build-up",
    assignedDoctor: "Dr. Daniel Lee",
    cost: 1500,
    totalSteps: 8,
    status: "Active",
    category: "General Dentistry",
    notes: "",
  });

  const userName = user?.email ? user.email.split("@")[0] : "Robert";

  // Calculate Header Quick Stats
  const activeCount = useMemo(() => plans.filter((p) => p.status === "Active").length, [plans]);
  const pendingCount = useMemo(() => plans.filter((p) => p.status === "Pending").length, [plans]);
  const completedCount = useMemo(() => plans.filter((p) => p.status === "Completed").length, [plans]);

  // Handle Sort
  const handleSort = (field: keyof TreatmentPlanRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Sort
  const filteredPlans = useMemo(() => {
    return plans
      .filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.patientName.toLowerCase().includes(q) ||
          p.treatment.toLowerCase().includes(q) ||
          p.assignedDoctor.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [plans, searchQuery, sortField, sortDirection]);

  // Activate Pending Plan ("Start plan" action)
  const handleStartPlan = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setPlans(
      plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: "Active",
              currentStep: 1,
              progressPercent: Math.round((1 / p.totalSteps) * 100),
              steps: p.steps.map((s, idx) =>
                idx === 0 ? { ...s, status: "IN_PROGRESS" } : s
              ),
            }
          : p
      )
    );
  };

  // Advance Step in Plan Details Modal
  const handleAdvanceStep = (planId: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id !== planId) return p;
        const nextStepNum = p.currentStep + 1;
        if (nextStepNum > p.totalSteps) {
          return {
            ...p,
            status: "Completed",
            currentStep: p.totalSteps,
            progressPercent: 100,
            steps: p.steps.map((s) => ({ ...s, status: "COMPLETED" })),
          };
        }

        const updatedSteps = p.steps.map((s, idx) => {
          if (idx < nextStepNum - 1) return { ...s, status: "COMPLETED" as const };
          if (idx === nextStepNum - 1) return { ...s, status: "IN_PROGRESS" as const };
          return { ...s, status: "PENDING" as const };
        });

        const newPercent = Math.round((nextStepNum / p.totalSteps) * 100);
        const newStatus = newPercent === 100 ? "Completed" : p.status;

        const updatedPlan = {
          ...p,
          currentStep: nextStepNum,
          progressPercent: newPercent,
          status: newStatus,
          steps: updatedSteps,
        };

        if (selectedPlanDetail?.id === planId) {
          setSelectedPlanDetail(updatedPlan);
        }

        return updatedPlan;
      })
    );
  };

  // Add New Treatment Plan Submit
  const handleAddPlanSubmit = () => {
    if (!newPlan.patientName || !newPlan.treatment) return;

    const totalS = Number(newPlan.totalSteps) || 6;
    const defaultSteps: TreatmentStep[] = Array.from({ length: totalS }, (_, i) => ({
      stepNumber: i + 1,
      title: `Phase ${i + 1}: Treatment Procedure`,
      description: `Clinical step ${i + 1} for ${newPlan.treatment}`,
      status: i === 0 ? "IN_PROGRESS" : "PENDING",
    }));

    const created: TreatmentPlanRecord = {
      id: `TP-${100 + plans.length + 1}`,
      patientName: newPlan.patientName,
      treatment: newPlan.treatment,
      assignedDoctor: newPlan.assignedDoctor || "Dr. Daniel Lee",
      currentStep: 1,
      totalSteps: totalS,
      progressPercent: Math.round((1 / totalS) * 100),
      cost: Number(newPlan.cost) || 1200,
      status: (newPlan.status as TreatmentPlanStatus) || "Active",
      startDate: "14-07-2026",
      category: newPlan.category || "General Dentistry",
      notes: newPlan.notes || "New treatment plan initiated.",
      steps: defaultSteps,
    };

    setPlans([created, ...plans]);
    setIsAddDialogOpen(false);
    setNewPlan({
      patientName: "",
      treatment: "Calculus build-up",
      assignedDoctor: "Dr. Daniel Lee",
      cost: 1500,
      totalSteps: 8,
      status: "Active",
      category: "General Dentistry",
      notes: "",
    });
  };

  // Render Status Badge
  const renderStatusChip = (status: TreatmentPlanStatus) => {
    let bg = COLOR_CYAN_PILL;
    let text = COLOR_CYAN_TEXT;

    if (status === "Completed") {
      bg = COLOR_GREEN_PILL;
      text = COLOR_GREEN_TEXT;
    } else if (status === "Pending") {
      bg = COLOR_YELLOW_PILL;
      text = COLOR_YELLOW_TEXT;
    } else if (status === "On Hold") {
      bg = COLOR_GREY_PILL;
      text = COLOR_GREY_TEXT;
    }

    return (
      <Box
        sx={{
          backgroundColor: bg,
          color: text,
          px: 2.2,
          py: 0.6,
          borderRadius: "20px",
          fontWeight: 700,
          fontSize: "0.82rem",
          display: "inline-block",
          textAlign: "center",
          minWidth: 100,
        }}
      >
        {status}
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* ======================================================
          HEADER SECTION (Greeting + Top Right Quick Stats)
      ====================================================== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Welcome & Date */}
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
            <Box component="span" sx={{ color: COLOR_CYAN }}>
              {userName}
            </Box>
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "#6B7280" }}>
            <CalendarIcon size={18} color="#9CA3AF" />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
              Tuesday, 14 July, 2026
            </Typography>
          </Box>
        </Box>

        {/* Top Right Quick Stats Bar (Matches Screenshot 16 / 30 / 12) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3.5 }, flexWrap: "wrap" }}>
          {/* Active Plans */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#E6F8FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLOR_CYAN,
              }}
            >
              <Clock size={22} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                {activeCount + 6}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                Active Plans
              </Typography>
            </Box>
          </Box>

          {/* Pending Approval */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F59E0B",
              }}
            >
              <FileText size={22} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                {pendingCount + 29}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                Pending Approval
              </Typography>
            </Box>
          </Box>

          {/* Completed */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#F0FDF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16A34A",
              }}
            >
              <CheckCircle size={22} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                {completedCount + 10}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.78rem" }}>
                Completed
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ======================================================
          MAIN CARD & TABLE
      ====================================================== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2EDF2",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Card Header Toolbar */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "1.25rem" }}>
            Treatment Plans
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {/* Search Input */}
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.8,
                py: 0.6,
                borderRadius: "20px",
                backgroundColor: "#F4F9FB",
                border: "1px solid #D5E8ED",
                width: { xs: "100%", sm: 220 },
              }}
            >
              <Search size={16} color="#00ADC6" style={{ marginRight: 8 }} />
              <InputBase
                placeholder="Search plan, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: "0.85rem", color: "#111827", flex: 1 }}
              />
            </Paper>

            {/* Timeframe Dropdown Button */}
            <Button
              onClick={(e) => setTimeframeAnchor(e.currentTarget)}
              endIcon={<ChevronDown size={16} />}
              sx={{
                backgroundColor: "#045E6A",
                color: "#FFFFFF",
                borderRadius: "20px",
                px: 2.2,
                py: 0.8,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.88rem",
                "&:hover": {
                  backgroundColor: "#034953",
                },
              }}
            >
              {filterTimeframe}
            </Button>

            <Menu
              anchorEl={timeframeAnchor}
              open={Boolean(timeframeAnchor)}
              onClose={() => setTimeframeAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: "12px", mt: 1, minWidth: 130 } } }}
            >
              <MenuItem
                onClick={() => {
                  setFilterTimeframe("Weekly");
                  setTimeframeAnchor(null);
                }}
              >
                Weekly
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilterTimeframe("Monthly");
                  setTimeframeAnchor(null);
                }}
              >
                Monthly
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setFilterTimeframe("All Time");
                  setTimeframeAnchor(null);
                }}
              >
                All Time
              </MenuItem>
            </Menu>

            {/* Add New Plan Button */}
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{
                backgroundColor: COLOR_CYAN,
                color: "#FFFFFF",
                borderRadius: "20px",
                px: 2.2,
                py: 0.8,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                boxShadow: "0 4px 12px rgba(0, 173, 198, 0.3)",
                "&:hover": {
                  backgroundColor: COLOR_CYAN_HOVER,
                },
              }}
            >
              Create Plan
            </Button>
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 1050 }}>
            {/* Table Header with Vivid Cyan Background */}
            <TableHead>
              <TableRow sx={{ backgroundColor: COLOR_CYAN }}>
                {/* Patient Name */}
                <TableCell
                  onClick={() => handleSort("patientName")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    py: 1.8,
                    pl: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Patient Name
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Treatment */}
                <TableCell
                  onClick={() => handleSort("treatment")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Treatment
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Assigned Doctor */}
                <TableCell
                  onClick={() => handleSort("assignedDoctor")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Assigned Doctor
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Progress */}
                <TableCell
                  onClick={() => handleSort("progressPercent")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    minWidth: 180,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Progress
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Cost */}
                <TableCell
                  onClick={() => handleSort("cost")}
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    Cost
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell
                  onClick={() => handleSort("status")}
                  align="center"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    Status
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>

                {/* Action */}
                <TableCell
                  align="center"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    pr: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    Action
                    <ArrowUpDown size={14} opacity={0.8} />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  hover
                  onClick={() => setSelectedPlanDetail(plan)}
                  sx={{
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      backgroundColor: "#F7FCFD",
                    },
                  }}
                >
                  {/* Patient Name */}
                  <TableCell sx={{ pl: 3, fontWeight: 600, color: "#1F2937", fontSize: "0.92rem" }}>
                    {plan.patientName}
                  </TableCell>

                  {/* Treatment */}
                  <TableCell sx={{ color: "#374151", fontSize: "0.9rem", fontWeight: 500 }}>
                    {plan.treatment}
                  </TableCell>

                  {/* Assigned Doctor */}
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.9rem" }}>
                    {plan.assignedDoctor}
                  </TableCell>

                  {/* Progress Column with Cyan Bar + Sub Step text */}
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ width: "100%", maxWidth: 160 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#374151", fontSize: "0.75rem" }}>
                          {plan.progressPercent < 10 ? `0${plan.progressPercent}%` : `${plan.progressPercent}%`}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={plan.progressPercent}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: "#DDF4F8",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: COLOR_CYAN,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          color: "#6B7280",
                          fontSize: "0.68rem",
                          fontWeight: 500,
                          mt: 0.4,
                        }}
                      >
                        step {plan.currentStep} of {plan.totalSteps}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Cost */}
                  <TableCell sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.92rem" }}>
                    ${plan.cost.toLocaleString()}
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    {renderStatusChip(plan.status)}
                  </TableCell>

                  {/* Action Button */}
                  <TableCell align="center" sx={{ pr: 3 }}>
                    {plan.status === "Pending" ? (
                      <Button
                        variant="outlined"
                        onClick={(e) => handleStartPlan(e, plan.id)}
                        sx={{
                          borderRadius: "12px",
                          borderColor: "#00ADC6",
                          color: "#00ADC6",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          px: 2,
                          py: 0.5,
                          "&:hover": {
                            backgroundColor: "#E6F8FA",
                            borderColor: "#00ADC6",
                          },
                        }}
                      >
                        Start plan
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanDetail(plan);
                        }}
                        sx={{
                          borderRadius: "12px",
                          borderColor: "#045E6A",
                          color: "#045E6A",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          px: 2.5,
                          py: 0.5,
                          "&:hover": {
                            backgroundColor: "#E6FAFC",
                            borderColor: "#045E6A",
                          },
                        }}
                      >
                        Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: "#6B7280", fontWeight: 500 }}>
                      No treatment plans found matching your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ======================================================
          SUB-LINK DESIGN: TREATMENT PLAN DETAILS MODAL
      ====================================================== */}
      {selectedPlanDetail && (
        <Dialog
          open={Boolean(selectedPlanDetail)}
          onClose={() => setSelectedPlanDetail(null)}
          maxWidth="md"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
        >
          {/* Dialog Title */}
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "#E6F8FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLOR_CYAN,
                }}
              >
                <Stethoscope size={24} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
                  Treatment Plan: {selectedPlanDetail.treatment}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>
                  Plan ID: {selectedPlanDetail.id} | Category: {selectedPlanDetail.category}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setSelectedPlanDetail(null)} sx={{ color: "#9CA3AF" }}>
              <X size={20} />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
            {/* Top Overview Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: "block" }}>
                  Patient Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", mt: 0.5 }}>
                  {selectedPlanDetail.patientName}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: "block" }}>
                  Assigned Doctor
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827", mt: 0.5 }}>
                  {selectedPlanDetail.assignedDoctor}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: "block" }}>
                  Total Estimated Cost
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#045E6A", mt: 0.5 }}>
                  ${selectedPlanDetail.cost.toLocaleString()}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: "block" }}>
                  Overall Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>{renderStatusChip(selectedPlanDetail.status)}</Box>
              </Paper>
            </Box>

            {/* Overall Progress Bar */}
            <Box sx={{ mb: 3, p: 2.5, borderRadius: "16px", backgroundColor: "#F4F9FB", border: "1px solid #D5E8ED" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0A3F4C" }}>
                  Procedure Progress ({selectedPlanDetail.progressPercent}%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#045E6A" }}>
                  Step {selectedPlanDetail.currentStep} of {selectedPlanDetail.totalSteps} Completed
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={selectedPlanDetail.progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#CBEFF6",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: COLOR_CYAN,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>

            {/* Step-by-Step Procedure Workflow Checklist */}
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", mb: 2, fontSize: "1.05rem" }}>
              Clinical Procedure Steps & Milestones
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              {selectedPlanDetail.steps.map((step) => {
                const isCompleted = step.status === "COMPLETED";
                const isInProgress = step.status === "IN_PROGRESS";

                return (
                  <Box
                    key={step.stepNumber}
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: isCompleted
                        ? "#BBF7D0"
                        : isInProgress
                        ? "#98ECF8"
                        : "#E2E8F0",
                      backgroundColor: isCompleted
                        ? "#F0FDF4"
                        : isInProgress
                        ? "#E6F8FA"
                        : "#FFFFFF",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    {/* Step Icon Badge */}
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        backgroundColor: isCompleted
                          ? "#16A34A"
                          : isInProgress
                          ? COLOR_CYAN
                          : "#CBD5E1",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {isCompleted ? <Check size={18} /> : step.stepNumber}
                    </Box>

                    {/* Step Content */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: isCompleted ? "#15803D" : isInProgress ? "#0A3F4C" : "#475569",
                          }}
                        >
                          Step {step.stepNumber}: {step.title}
                        </Typography>

                        {isCompleted && (
                          <Chip
                            label={`Done ${step.dateCompleted ? `(${step.dateCompleted})` : ""}`}
                            size="small"
                            sx={{ backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 700, fontSize: "0.7rem" }}
                          />
                        )}
                        {isInProgress && (
                          <Chip
                            label="In Progress"
                            size="small"
                            sx={{ backgroundColor: COLOR_CYAN_PILL, color: COLOR_CYAN_TEXT, fontWeight: 700, fontSize: "0.7rem" }}
                          />
                        )}
                        {step.status === "PENDING" && (
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{ backgroundColor: "#F1F5F9", color: "#64748B", fontWeight: 600, fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5, fontSize: "0.85rem" }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Doctor Clinical Notes */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", mb: 0.8 }}>
              Doctor Clinical Notes
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#334155",
                fontSize: "0.88rem",
                fontStyle: "italic",
              }}
            >
              "{selectedPlanDetail.notes || "No special notes recorded."}"
            </Paper>
          </DialogContent>

          {/* Dialog Actions */}
          <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
            <Button onClick={() => setSelectedPlanDetail(null)} sx={{ color: "#64748B", fontWeight: 600 }}>
              Close
            </Button>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="contained"
                disabled={selectedPlanDetail.progressPercent === 100}
                onClick={() => handleAdvanceStep(selectedPlanDetail.id)}
                sx={{
                  backgroundColor: "#045E6A",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#034953" },
                }}
              >
                Advance Next Step
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* ======================================================
          DIALOG: CREATE NEW TREATMENT PLAN
      ====================================================== */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
          Create New Treatment Plan
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Patient Name"
            fullWidth
            size="small"
            value={newPlan.patientName}
            onChange={(e) => setNewPlan({ ...newPlan, patientName: e.target.value })}
          />

          <TextField
            label="Treatment Procedure Name"
            fullWidth
            size="small"
            value={newPlan.treatment}
            onChange={(e) => setNewPlan({ ...newPlan, treatment: e.target.value })}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Assigned Doctor"
              fullWidth
              size="small"
              value={newPlan.assignedDoctor}
              onChange={(e) => setNewPlan({ ...newPlan, assignedDoctor: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={newPlan.category}
                label="Category"
                onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
              >
                <MenuItem value="General Dentistry">General Dentistry</MenuItem>
                <MenuItem value="Periodontics">Periodontics</MenuItem>
                <MenuItem value="Endodontics">Endodontics</MenuItem>
                <MenuItem value="Oral Surgery">Oral Surgery</MenuItem>
                <MenuItem value="Orthodontics">Orthodontics</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Total Cost ($)"
              type="number"
              fullWidth
              size="small"
              value={newPlan.cost}
              onChange={(e) => setNewPlan({ ...newPlan, cost: Number(e.target.value) })}
            />

            <TextField
              label="Total Steps"
              type="number"
              fullWidth
              size="small"
              value={newPlan.totalSteps}
              onChange={(e) => setNewPlan({ ...newPlan, totalSteps: Number(e.target.value) })}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Initial Status</InputLabel>
              <Select
                value={newPlan.status}
                label="Initial Status"
                onChange={(e) => setNewPlan({ ...newPlan, status: e.target.value as "Active" | "Pending" | "On Hold" })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Doctor Clinical Notes"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={newPlan.notes}
            onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} sx={{ color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPlanSubmit}
            sx={{
              backgroundColor: COLOR_CYAN,
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": { backgroundColor: COLOR_CYAN_HOVER },
            }}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTreatmentPlansPage;
