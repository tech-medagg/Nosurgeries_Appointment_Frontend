import api from "./api";

import type {
  Doctor,
  GetDoctorsParams,
  GetDoctorsResponse,
} from "../types/doctor.types";

export const getDoctorsApi = async (
  params: GetDoctorsParams = {}
): Promise<GetDoctorsResponse> => {
  const response =
    await api.get<GetDoctorsResponse>(
      "/doctors",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 100,
          search: params.search,
          hospitalId:
            params.hospitalId,
          departmentId:
            params.departmentId,
          status:
            params.status ?? "ACTIVE",
          sortBy:
            params.sortBy ?? "createdAt",
          order:
            params.order ?? "asc",
        },
      }
    );

  return response.data;
};

export const getDoctorByIdApi =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: Doctor;
  }> => {
    const response =
      await api.get<{
        success: boolean;
        message?: string;
        data: Doctor;
      }>(`/doctors/${id}`);

    return response.data;
  };

export const getMyDoctorProfileApi =
  async (): Promise<{
    success: boolean;
    message?: string;
    data: Doctor;
  }> => {
    try {
      const response =
        await api.get<{
          success: boolean;
          message?: string;
          data: Doctor;
        }>("/doctors/me");

      return response.data;
    } catch (error: any) {
      // If server returns 404/no-profile, treat as success:false
      // so React Query does not enter the error state.
      const serverData = error?.response?.data;
      if (serverData) return serverData;
      throw error;
    }
  };

export const updateDoctorApi = async (
  id: string,
  payload: Partial<Doctor>
): Promise<{
  success: boolean;
  message: string;
  data?: Doctor;
}> => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data?: Doctor;
  }>(`/doctors/${id}`, payload);

  return response.data;
};