export interface MedicalReport {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: string;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportApiResponse {
  success: boolean;
  message?: string;
  data: MedicalReport[];
}

export interface SingleReportApiResponse {
  success: boolean;
  message?: string;
  data: MedicalReport;
}
