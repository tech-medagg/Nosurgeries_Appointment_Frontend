import api from "./api";

import type {
  Department,
  GetDepartmentsParams,
  GetDepartmentsResponse,
} from "../types/department.types";

export const getDepartmentsApi = async (
  params: GetDepartmentsParams = {}
): Promise<GetDepartmentsResponse> => {
  const response =
    await api.get<GetDepartmentsResponse>(
      "/departments",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 100,
          search: params.search,
          isActive:
            params.isActive ?? "true",
          sortBy:
            params.sortBy ?? "name",
          order:
            params.order ?? "asc",
        },
      }
    );

  return response.data;
};

export const getDepartmentByIdApi =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
    data: Department;
  }> => {
    const response =
      await api.get<{
        success: boolean;
        message?: string;
        data: Department;
      }>(`/departments/${id}`);

    return response.data;
  };