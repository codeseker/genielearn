import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api-response";

export interface HeadingBlock {
  type: "heading";
  text: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface CodeBlock {
  type: "code";
  language: string;
  text: string;
}

export interface MCQBlock {
  type: "mcq";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type ContentBlock = HeadingBlock | ParagraphBlock | CodeBlock | MCQBlock;

export interface LessonContentResponse {
  content: ContentBlock[];
  navigation: {
    nextModuleSlug: string | null;
    nextLessonSlug: string | null;
    prevModuleSlug: string | null;
    previousLessonSlug: string | null;
  };
  ytVideos: string[];
}

export async function generateLessonContent({
  courseId,
  moduleId,
  lessonId,
}: {
  courseId: string;
  moduleId: string;
  lessonId: string;
}): Promise<ApiResponse<LessonContentResponse>> {
  const res = await api.post("/lesson/create", {
    courseId,
    moduleId,
    lessonId,
  });

  return res.data;
}

export async function updateLesson({
  lessonId,
  courseId,
  moduleId,
  complete,
}: {
  lessonId: string;
  courseId: string;
  moduleId: string;
  complete: boolean;
}): Promise<ApiResponse<LessonContentResponse>> {
  const res = await api.put(`/lesson/${lessonId}/update`, {
    lessonId,
    courseId,
    moduleId,
    complete,
  });

  return res.data;
}
