import type { ApiResponse } from "@/types/api-response";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BACKEND_API_URL_LOCAL;

export interface LessonContentResponse {
    content: string;
}

export async function generateLessonContent(
  token: string,
  {
    courseId,
    moduleId,
    lessonId,
  }: {
    courseId: string;
    moduleId: string;
    lessonId: string;
  }
): Promise<ApiResponse<LessonContentResponse>> {
  const res = await axios.post(
    `${baseUrl}/lesson/create`,
    {
      courseId,
      moduleId,
      lessonId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    }
  );
  return res.data as ApiResponse<LessonContentResponse>;
}
