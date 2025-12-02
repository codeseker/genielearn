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
    courseId: string, 
    title: string;
    totalModules: number,
    totalLessons: number
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


export async function createCourse(token: string, {
    userQuery,
    targetAudience,
    level,
    duration,
    topicType
}: {
    userQuery: string;
    targetAudience: string;
    level: string;
    duration: string;
    topicType: string;
}): Promise<ApiResponse<CreateCourseResponse>> {
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const res = await axios.post(`${baseUrl}/course/create`, { userQuery, targetAudience, level, duration, topicType }, { headers });
    return res.data as ApiResponse<CreateCourseResponse>;
}