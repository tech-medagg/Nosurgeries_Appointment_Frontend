import api from "./api";

import type {
  CreatePatientProfileRequest,
  PatientProfileResponse,
} from "../types/patient.types";

/* ======================================================
   Get My Patient Profile
====================================================== */

export const getMyPatientProfileApi =
  async (): Promise<PatientProfileResponse> => {
    const response =
      await api.get<PatientProfileResponse>(
        "/patients/me"
      );

    return response.data;
  };

/* ======================================================
   Create My Patient Profile
====================================================== */

export const createMyPatientProfileApi =
  async (
    payload: CreatePatientProfileRequest
  ): Promise<PatientProfileResponse> => {
    const response =
      await api.post<PatientProfileResponse>(
        "/patients/me",
        payload
      );

    return response.data;
  };

/* ======================================================
   Update My Patient Profile
====================================================== */

export const updateMyPatientProfileApi =
  async (
    payload: Partial<CreatePatientProfileRequest>
  ): Promise<PatientProfileResponse> => {
    const response =
      await api.put<PatientProfileResponse>(
        "/patients/me",
        payload
      );

    return response.data;
  };

/* ======================================================
   Get All Patients (Admin)
====================================================== */

export const getPatientsApi = async (params?: Record<string, unknown>): Promise<unknown> => {
  const response = await api.get("/patients", { params });
  return response.data;
};