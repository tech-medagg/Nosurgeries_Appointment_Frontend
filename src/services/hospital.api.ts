import api from "./api";

import type {
  GetHospitalsParams,
  GetHospitalsResponse,
  Hospital,
} from "../types/hospital.types";

export const getHospitalsApi = async (
  params: GetHospitalsParams = {}
): Promise<GetHospitalsResponse> => {
  const response =
    await api.get<GetHospitalsResponse>(
      "/hospitals",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 100,
          search: params.search,
          isActive:
            params.isActive ?? true,
          sortBy:
            params.sortBy ?? "name",
          order:
            params.order ?? "asc",
        },
      }
    );

  return response.data;
};

export const getHospitalByIdApi = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
  data: Hospital;
}> => {
  const response =
    await api.get<{
      success: boolean;
      message: string;
      data: Hospital;
    }>(`/hospitals/${id}`);

  return response.data;
};