export interface Doctor {
  id: string;
  userId: string;
  hospitalId: string;
  departmentId: string;

  firstName: string;
  lastName: string | null;

  gender:
    | "MALE"
    | "FEMALE"
    | "OTHER"
    | null;

  dateOfBirth: string | null;
  profileImage: string | null;

  qualification: string;
  specialization: string;
  registrationNumber: string | null;

  experienceYears: number;
  consultationFee: number | null;

  languages: string | null;
  biography: string | null;

  isAvailable: boolean;

  status:
    | "ACTIVE"
    | "INACTIVE";

  createdAt: string;
  updatedAt: string;
}

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  hospitalId?: string;
  departmentId?: string;
  status?: "ACTIVE" | "INACTIVE";
  sortBy?:
    | "createdAt"
    | "experienceYears"
    | "consultationFee";
  order?: "asc" | "desc";
}

export interface GetDoctorsResponse {
  success: boolean;
  message: string;
  data: Doctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}