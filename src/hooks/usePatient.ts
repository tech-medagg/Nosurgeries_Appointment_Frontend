import { useQuery } from "@tanstack/react-query";

import {
  getMyPatientProfileApi,
} from "../services/patient.api";

export const useMyPatientProfile = () => {
  return useQuery({
    queryKey: ["patient", "me"],
    queryFn: getMyPatientProfileApi,
  });
};