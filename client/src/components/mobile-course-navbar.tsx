import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Layers } from "lucide-react";
import type { Course, Lesson, Module } from "@/types/common";

interface Props {
  course: Course;
  selectedModule: Module;
  selectedLesson: Lesson;
}

export function MobileCourseNavigator({
  course,
  selectedModule,
  selectedLesson,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden pt-2 border-b border-border bg-background">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-3 py-2">
        {/* MODULE */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-foreground">
          <Layers className="h-4 w-4 shrink-0 text-foreground" />

          <Select
            value={selectedModule.slug}
            onValueChange={(moduleSlug) => {
              const module = course.modules.find((m) => m.slug === moduleSlug);
              if (!module || module.lessons.length === 0) return;

              navigate(
                `/course/${course.slug}/module/${module.slug}/lesson/${module.lessons[0].slug}`,
              );
            }}
          >
            <SelectTrigger className="pl-4 h-8 w-full min-w-0 border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue className="truncate text-sm font-medium text-foreground" />
            </SelectTrigger>

            <SelectContent>
              {course.modules.map((module) => (
                <SelectItem key={module.id} value={module.slug}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px shrink-0 bg-border" />
        <div className="sm:hidden h-px w-full bg-border" />

        {/* LESSON */}
        <div className="flex min-w-0 flex-1 items-center gap-2 text-foreground">
          <BookOpen className="h-4 w-4 shrink-0 text-foreground" />

          <Select
            value={selectedLesson.slug}
            onValueChange={(lessonSlug) => {
              navigate(
                `/course/${course.slug}/module/${selectedModule.slug}/lesson/${lessonSlug}`,
              );
            }}
          >
            <SelectTrigger className="pl-4 h-8 w-full min-w-0 border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue className="truncate text-sm font-medium text-foreground" />
            </SelectTrigger>

            <SelectContent>
              {selectedModule.lessons.map((lesson) => (
                <SelectItem key={lesson._id} value={lesson.slug}>
                  {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
