export interface PatientProfile {
  id: string;
  userId: string;

  firstName: string;
  lastName: string | null;

  gender:
    | "MALE"
    | "FEMALE"
    | "OTHER"
    | null;

  dateOfBirth: string | null;

  bloodGroup: string | null;
  language: string | null;

  profileImage: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  emergencyContact: string | null;
  emergencyContactName: string | null;

  medicalHistory: string | null;
  allergies: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface GetMyPatientResponse {
  success: boolean;
  data: PatientProfile;
  message?: string;
}

export type PatientGender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export interface PatientProfile {
  id: string;
  userId: string;

  fullName: string;
  email: string;
  mobile: string;

  firstName: string;
  lastName: string | null;

  gender: PatientGender | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  language: string | null;
  profileImage: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  emergencyContact: string | null;
  emergencyContactName: string | null;

  medicalHistory: string | null;
  allergies: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface PatientProfileResponse {
  success: boolean;
  message?: string;
  data?: PatientProfile;
}

export interface CreatePatientProfileRequest {
  firstName: string;
  lastName?: string;
  gender?: PatientGender;
  dateOfBirth?: string;
  bloodGroup?: string;
  language?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  medicalHistory?: string;
  allergies?: string;
}