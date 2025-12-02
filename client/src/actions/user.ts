import type { LoginSchema } from "@/components/login-form";
import type { ApiResponse } from "@/types/api-response";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BACKEND_API_URL_LOCAL;

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  refreshToken: string;
  token: string;
}

export async function login(
  data: LoginSchema
): Promise<ApiResponse<LoginResponse>> {
  const res = await axios.post(`${baseUrl}/auth/login`, data);
  return res.data as ApiResponse<LoginResponse>;
}
