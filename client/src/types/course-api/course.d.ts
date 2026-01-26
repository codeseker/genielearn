import type { Course, CourseWithStats } from "../common";

export interface SingleCourseResponse {
  course: Course;
}

export interface MultipleCoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCourseResponse {
  courseId: string;
  title: string;
  description: string;
  slug: string;
}

export interface DeleteCourseResponse {}

export interface CoursesWithStatsResponse {
  courses: CourseWithStats[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
