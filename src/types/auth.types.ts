export interface LoginRequest {
  identifier: string; // email OR mobile number
  password: string;
}


export interface RegisterRequest {
  roleId?: string;
  roleName?: "PATIENT" | "DOCTOR" | "ADMIN" | string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface LoginUser {
  id: string;
  roleId: string;
  roleName: string;
  fullName: string;
  email: string;
  mobile: string;
  status: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  roleId: string;
  roleName: string;
  email: string;

  fullName?: string;
  mobile?: string;
  status?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: LoginUser;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    userId: string;
    roleId: string;
    roleName: string;
    email: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: LoginUser;
}