import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api-response";
import type {
  CoursesWithStatsResponse,
  CreateCourseResponse,
  DeleteCourseResponse,
  MultipleCoursesResponse,
  SingleCourseResponse,
} from "@/types/course-api/course";

export async function indexCourses({
  page, 
  limit = 15,
  search,
}: {
  page: number;
  limit?: number;
  search?: string;
}): Promise<
  ApiResponse<MultipleCoursesResponse>
> {
  const res = await api.get(`/course/all?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
}

export async function showCourse({
  courseId,
}: {
  courseId: string;
}): Promise<ApiResponse<SingleCourseResponse>> {
  const res = await api.get(`/course/${courseId}/view`);
  return res.data;
}

export async function createCourse({
  prompt,
}: {
  prompt: string;
}): Promise<ApiResponse<CreateCourseResponse>> {
  const res = await api.post("/course/create", { prompt });
  return res.data;
}

export async function deleteCourse({
  courseId,
}: {
  courseId: string;
}): Promise<ApiResponse<DeleteCourseResponse>> {
  const res = await api.delete(`/course/${courseId}/delete`);
  return res.data;
}

export async function coursesWithStats(): Promise<
  ApiResponse<CoursesWithStatsResponse>
> {
  const res = await api.get("/course/stats");
  return res.data;
}
