export interface Hospital {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetHospitalsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "city" | "createdAt";
  order?: "asc" | "desc";
}

export interface GetHospitalsResponse {
  success: boolean;
  message: string;
  data: Hospital[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}