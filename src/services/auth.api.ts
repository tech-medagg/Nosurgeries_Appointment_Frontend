import api from "./api";

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export const loginApi = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

export const registerApi = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", payload);
  return response.data;
};

export const getRolesApi = async () => {
  const response = await api.get<{
    success: boolean;
    data: Array<{ id: string; name: string; description?: string }>;
  }>("/auth/roles");
  return response.data;
};

export const getMeApi = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");
  return response.data;
};

export const updateMeApi = async (payload: {
  fullName?: string;
  mobile?: string;
  email?: string;
}) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data?: any;
  }>("/auth/me", payload);
  return response.data;
};

/* ── Forgot / Reset Password ─────────────────────────── */

export const forgotPasswordApi = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordApi = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
};

/* ── Google OAuth (id_token path — GoogleLogin component) ── */
export const googleLoginApi = async (payload: {
  credential?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  googleId?: string;
  roleId?: string;
  roleName?: string;
}) => {
  const response = await api.post("/auth/google", payload);
  return response.data;
};

/* ── Lookup User Roles by Emails ────────────────────── */
export const lookupRolesApi = async (emails: string[]) => {
  const response = await api.post<{
    success: boolean;
    data: Record<string, { exists: boolean; roleName?: "PATIENT" | "DOCTOR" | "ADMIN" | "SUPER_ADMIN"; fullName?: string }>;
  }>("/auth/lookup-roles", { emails });
  return response.data;
};