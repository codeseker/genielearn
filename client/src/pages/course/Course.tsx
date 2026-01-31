import { useLocation, useNavigate } from "react-router-dom";
import { CourseNavbar } from "@/components/course-navbar";
import { LessonContent } from "@/pages/lesson/Lesson";
import useFetchSingleCourse from "@/hooks/courses/useFetchSingleCourse";

import { useCourseNavigation } from "@/hooks/courses/useCourseNavigation";
import { useEffect } from "react";

export default function CoursePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    courseData: course,
    isLoading,
    isError,
    error,
  } = useFetchSingleCourse();

  const { selectedModule, selectedLesson } = useCourseNavigation(course);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  if (isError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="space-y-5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Course not found
          </h1>
          <p className="text-muted-foreground">
            The course you are looking for doesn’t exist or may have been
            removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="font-medium text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden animate-pulse">
        <div className="h-16 border-b bg-background px-6 flex items-center justify-between">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 rounded bg-muted" />
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8 space-y-8">
          <div className="h-4 w-56 rounded bg-muted" />

          <div className="h-10 w-3/4 rounded bg-muted" />

          <div className="flex gap-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>

          <div className="space-y-6 pt-4">
            <div className="h-24 w-full rounded-lg bg-muted" />
            <div className="h-40 w-full rounded-lg bg-muted" />
            <div className="h-28 w-5/6 rounded-lg bg-muted" />
            <div className="h-56 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedModule || !selectedLesson) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <CourseNavbar
        course={course!}
        selectedModule={selectedModule}
        selectedLesson={selectedLesson}
      />

      <LessonContent
        lesson={selectedLesson}
        module={selectedModule}
        courseTitle={course!.title}
        courseSlug={course!.slug}
      />
    </div>
  );
}
