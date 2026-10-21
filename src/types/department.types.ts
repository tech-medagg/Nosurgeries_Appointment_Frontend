export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: string | null;
  isActive: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
  sortBy?:
    | "name"
    | "displayOrder"
    | "createdAt";
  order?: "asc" | "desc";
}

export interface GetDepartmentsResponse {
  success: boolean;
  message?: string;
  data: Department[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}