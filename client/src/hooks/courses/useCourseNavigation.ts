import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Course } from "@/types/common";

export function useCourseNavigation(course?: Course) {
  const { moduleId: moduleSlug, lessonId: lessonSlug } = useParams<{
    moduleId: string;
    lessonId: string;
  }>();

  const selectedModule = useMemo(() => {
    if (!course || !moduleSlug) return null;
    return course.modules.find((m) => m.slug === moduleSlug) ?? null;
  }, [course, moduleSlug]);

  const selectedLesson = useMemo(() => {
    if (!selectedModule || !lessonSlug) return null;
    return selectedModule.lessons.find((l) => l.slug === lessonSlug) ?? null;
  }, [selectedModule, lessonSlug]);

  return {
    selectedModule,
    selectedLesson,
  };
}
