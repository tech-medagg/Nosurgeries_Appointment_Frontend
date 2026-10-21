import api from "./api";

import type {
  Appointment,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  UpdateAppointmentRequest,
  DoctorAvailabilityResponse,
  GetAppointmentsParams,
  GetAppointmentsResponse,
} from "../types/appointment.types";

export const getDoctorAvailabilityApi =
  async (
    hospitalId?: string,
    departmentId?: string,
    appointmentDate?: string
  ): Promise<DoctorAvailabilityResponse> => {
    const params: Record<string, string> = {};
    if (hospitalId) params.hospitalId = hospitalId;
    if (departmentId) params.departmentId = departmentId;
    if (appointmentDate) params.appointmentDate = appointmentDate;

    const response =
      await api.get<DoctorAvailabilityResponse>(
        "/appointments/availability",
        { params }
      );

    return response.data;
  };

export const createAppointmentApi =
  async (
    payload: CreateAppointmentRequest
  ): Promise<CreateAppointmentResponse> => {
    const response =
      await api.post<CreateAppointmentResponse>(
        "/appointments",
        payload
      );

    return response.data;
  };

export const getAppointmentsApi =
  async (
    params: GetAppointmentsParams = {}
  ): Promise<GetAppointmentsResponse> => {
    const response =
      await api.get<GetAppointmentsResponse>(
        "/appointments",
        {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            patientId:
              params.patientId,
            doctorProfileId:
              params.doctorProfileId,
            hospitalId:
              params.hospitalId,
            departmentId:
              params.departmentId,
            status:
              params.status,
            order:
              params.order ?? "desc",
          },
        }
      );

    return response.data;
  };

export const getAppointmentByIdApi =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: Appointment;
  }> => {
    const response =
      await api.get<{
        success: boolean;
        message?: string;
        data: Appointment;
      }>(`/appointments/${id}`);

    return response.data;
  };

export const updateAppointmentApi =
  async (
    id: string,
    payload: UpdateAppointmentRequest
  ): Promise<{
    success: boolean;
    message: string;
    data?: Appointment;
  }> => {
    const response =
      await api.put<{
        success: boolean;
        message: string;
        data?: Appointment;
      }>(`/appointments/${id}`, payload);

    return response.data;
  };

export const deleteAppointmentApi =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response =
      await api.delete<{
        success: boolean;
        message: string;
      }>(`/appointments/${id}`);

    return response.data;
  };