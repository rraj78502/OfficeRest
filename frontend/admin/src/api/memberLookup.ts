import axios from "axios";
import { MemberLookup } from "@/types/member";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const lookupMemberByEmployeeId = async (employeeId: string): Promise<MemberLookup> => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/user/lookup`, {
    params: { employeeId },
    withCredentials: true,
    headers: {
      "x-admin-frontend": "true",
    },
  });

  return response.data.data as MemberLookup;
};
