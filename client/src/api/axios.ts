import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { store } from "@/store/store";
import { setUser, clearUser } from "@/store/slices/user";
import { refreshUser } from "@/actions/user";

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token as string);
  });
  failedQueue = [];
};

const APP_MODE = import.meta.env.VITE_APP_MODE;

export const api = axios.create({
  baseURL:
    APP_MODE === "development"
      ? import.meta.env.VITE_BACKEND_API_URL_LOCAL
      : import.meta.env.VITE_BACKEND_API_URL_PROD,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    if (!state.user.user) {
      return config;
    }
    const token = state.user.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const state = store.getState();
    const refreshToken = state.user.user?.refreshToken;

    if (!refreshToken) {
      store.dispatch(clearUser());
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const result = await refreshUser(refreshToken);

      if (!result.success) {
        throw new Error("Refresh failed");
      }
      if (!result.data) {
        throw new Error("Refresh failed");
      }

      const newAccessToken = result.data.accessToken;

      store.dispatch(setUser(result.data));

      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      if (originalRequest.headers)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      store.dispatch(clearUser());

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
