import api from "./api";
import type { ReportApiResponse, SingleReportApiResponse } from "../types/report.types";

export const uploadReportApi = async (formData: FormData): Promise<SingleReportApiResponse> => {
  const response = await api.post<SingleReportApiResponse>("/reports", formData);
  return response.data;
};

export const getMyReportsApi = async (): Promise<ReportApiResponse> => {
  const response = await api.get<ReportApiResponse>("/reports/me");
  return response.data;
};

export const getAdminAppointmentReportsApi = async (appointmentId: string): Promise<ReportApiResponse> => {
  const response = await api.get<ReportApiResponse>(`/reports/admin/appointments/${appointmentId}`);
  return response.data;
};

export const getDoctorAppointmentReportsApi = async (appointmentId: string): Promise<ReportApiResponse> => {
  const response = await api.get<ReportApiResponse>(`/reports/doctor/appointments/${appointmentId}`);
  return response.data;
};
