import type { LoginSchema } from "@/components/login-form";
import type { ApiResponse } from "@/types/api-response";
import { api } from "@/api/axios";
import type { RegisterSchema } from "@/components/signup-form";

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    refreshToken: string;
    avatar?: {
      _id: string;
      url: string;
    } | null;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    refreshToken: string;
    avatar?: {
      _id: string;
      url: string;
    } | null;
  };
  token: string;
}

export async function login(
  data: LoginSchema,
): Promise<ApiResponse<LoginResponse>> {
  const res = await api.post("/auth/login", data);
  return res.data;
}

export interface RefreshUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    refreshToken: string;
  };
  accessToken: string;
}

export async function refreshUser(
  refreshToken: string | null | undefined,
): Promise<ApiResponse<RefreshUserResponse>> {
  const res = await api.post(
    "/auth/refresh",
    { refreshToken },
    {
      withCredentials: true,
    },
  );
  return res.data;
}

export async function register(
  data: RegisterSchema,
): Promise<ApiResponse<RegisterResponse>> {
  const res = await api.post("/auth/register", {
    username: data.username,
    email: data.email,
    password: data.password,
    firstName: data.first_name,
    lastName: data.last_name,
  });
  return res.data;
}

export interface GoogleAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    refreshToken: string;
    avatar?: {
      _id: string;
      url: string;
    } | null;
  };
  token: string;
}

export async function googleAuth(
  code: string,
): Promise<ApiResponse<GoogleAuthResponse>> {
  const res = await api.post("/auth/social-login/google", { code });
  return res.data;
}
