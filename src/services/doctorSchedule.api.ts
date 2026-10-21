import api from "./api";

export interface DoctorScheduleItem {
  id: string;
  doctorProfileId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorSchedulePayload {
  doctorProfileId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  isAvailable?: boolean;
}

export const getDoctorSchedulesApi = async (doctorProfileId: string): Promise<{ success: boolean; data: DoctorScheduleItem[] }> => {
  const res = await api.get<{ success: boolean; data: DoctorScheduleItem[] }>("/doctor-schedules", {
    params: { doctorProfileId, limit: 50 },
  });
  return res.data;
};

export const createDoctorScheduleApi = async (payload: CreateDoctorSchedulePayload): Promise<{ success: boolean; message?: string; data?: DoctorScheduleItem }> => {
  const res = await api.post<{ success: boolean; message?: string; data?: DoctorScheduleItem }>("/doctor-schedules", payload);
  return res.data;
};

export const updateDoctorScheduleApi = async (id: string, payload: Partial<CreateDoctorSchedulePayload>): Promise<{ success: boolean; message?: string; data?: DoctorScheduleItem }> => {
  const res = await api.put<{ success: boolean; message?: string; data?: DoctorScheduleItem }>(`/doctor-schedules/${id}`, payload);
  return res.data;
};

export const deleteDoctorScheduleApi = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const res = await api.delete<{ success: boolean; message?: string }>(`/doctor-schedules/${id}`);
  return res.data;
};
