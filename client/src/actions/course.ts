import axios from "axios";
import type { ApiResponse } from "@/types/api-response";
import type { Course } from "@/types/common";

const baseUrl = import.meta.env.VITE_BACKEND_API_URL_LOCAL;

export interface SingleCourseResponse {
  course: Course;
}

export interface MultipleCoursesResponse {
  courses: Course[];
}

export interface CreateCourseResponse {
  courseId: string;
  title: string;
  description: string;
}

export async function indexCourses(
  token: string
): Promise<ApiResponse<MultipleCoursesResponse>> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await axios.get(`${baseUrl}/course/all`, { headers });
  return res.data as ApiResponse<MultipleCoursesResponse>;
}

export async function showCourse(
  token: string,
  { courseId }: { courseId: string }
): Promise<ApiResponse<SingleCourseResponse>> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await axios.get(`${baseUrl}/course/${courseId}/view`, {
    headers,
  });
  return res.data;
}

export async function createCourse(
  token: string,
  {
    prompt,
  }: {
    prompt: string;
  }
): Promise<ApiResponse<CreateCourseResponse>> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await axios.post(
    `${baseUrl}/course/create`,
    { prompt },
    { headers }
  );
  return res.data as ApiResponse<CreateCourseResponse>;
}
