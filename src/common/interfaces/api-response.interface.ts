export interface ApiResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse<T = any> {
  success: false;
  message: string;
  errors: T;
}