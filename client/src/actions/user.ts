import type { LoginSchema } from "@/components/login-form";
import type { ApiResponse } from "@/types/api-response";
import { api } from "@/api/axios";
import type { RegisterSchema } from "@/components/signup-form";
import axios from "axios";

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
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await axios.post(
    "/auth/refresh",
    { refreshToken },
    {
      baseURL:
        import.meta.env.VITE_APP_MODE === "development"
          ? import.meta.env.VITE_BACKEND_API_URL_LOCAL
          : import.meta.env.VITE_BACKEND_API_URL_PROD,
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

export interface IUploadAvatarResponse {
  _id: string;
  url: string;
}

export async function uploadAvatar(
  formData: FormData,
): Promise<ApiResponse<IUploadAvatarResponse>> {
  const res = await api.post("/user/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
