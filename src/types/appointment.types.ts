export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export interface DoctorAvailability {
  doctorProfileId: string;

  firstName: string;
  lastName: string | null;
  doctorName: string;

  hospitalId?: string;
  hospitalName?: string;
  departmentId?: string;
  departmentName?: string;

  dayOfWeek: string;

  startTime: string;
  endTime: string;

  slotDuration: number;
  maxPatients: number;
  bookedPatients: number;

  availableSlots: string[];
  allSlots?: string[];
  bookedSlots?: string[];
}

export interface DoctorAvailabilityResponse {
  success: boolean;
  message: string;
  data: DoctorAvailability[];
}

export interface CreateAppointmentRequest {
  patientId: string;
  hospitalId: string;
  departmentId: string;
  doctorProfileId?: string;
  appointmentDate: string;
  appointmentTime?: string;
  consultationFee?: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  patientId?: string;
  hospitalId?: string;
  departmentId?: string;
  doctorProfileId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  consultationFee?: number;
  notes?: string;
  status?: AppointmentStatus;
}

export interface Appointment {
  id: string;

  patientId: string;
  hospitalId: string;
  departmentId: string;
  doctorProfileId: string | null;

  appointmentDate: string;
  appointmentTime: string | null;

  consultationFee: number | null;
  notes: string | null;

  status: AppointmentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListItem extends Appointment {
  patientFirstName?: string;
  patientLastName?: string;
  patientMobile?: string;
  patientEmail?: string;
  hospitalName?: string;
  departmentName?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  prescriptionUrl?: string | null;
  prescriptionFileName?: string | null;
  prescriptionFileType?: string | null;
  isOldPatient?: boolean;
  patientAppointmentCount?: number;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data?: Appointment;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorProfileId?: string;
  hospitalId?: string;
  departmentId?: string;
  status?: AppointmentStatus;
  order?: "asc" | "desc";
}

export interface GetAppointmentsResponse {
  success: boolean;
  appointments: AppointmentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}