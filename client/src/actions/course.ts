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

export async function indexCourses(token: string): Promise<ApiResponse<MultipleCoursesResponse>> {
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const res = await axios.get(`${baseUrl}/course/all`, { headers });
    return res.data;
}

export async function showCourse(
    token: string, 
    { courseId }: { courseId: string }
): Promise<ApiResponse<SingleCourseResponse>> {
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const res = await axios.get(`${baseUrl}/course/${courseId}/view`, { headers });
    return res.data;
}