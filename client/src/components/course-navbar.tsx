import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import type { Course, Lesson, Module } from "@/types/common";

import { MobileCourseNavigator } from "@/components/mobile-course-navbar";

interface CourseNavbarProps {
  course: Course;
  selectedModule: Module;
  selectedLesson: Lesson;
}

export function CourseNavbar({
  course,
  selectedModule,
  selectedLesson,
}: CourseNavbarProps) {
  const navigate = useNavigate();
  const [moduleOpen, setModuleOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);

  return (
    <>
      
      <div className="lg:hidden">
        <MobileCourseNavigator
          course={course}
          selectedModule={selectedModule}
          selectedLesson={selectedLesson}
        />
      </div>

      <nav className="hidden lg:block sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
        <div className="flex h-14 items-center gap-2 px-6">
          {/* Home */}
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>

          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />

          {/* Course Name */}
          <span className="max-w-[180px] truncate text-sm font-medium text-muted-foreground">
            {course.title}
          </span>

          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />

          {/* MODULE DROPDOWN */}
          <DropdownMenu open={moduleOpen} onOpenChange={setModuleOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-1 px-2 text-sm font-medium hover:bg-accent"
              >
                <span className="truncate max-w-[200px]">
                  {selectedModule.title}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform opacity-70",
                    moduleOpen && "rotate-180",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64">
              {course.modules.map((module) => (
                <DropdownMenuItem
                  key={module.id}
                  onClick={() => {
                    let url = `/course/${course.slug}/module/${module.slug}`;
                    if (module.lessons.length > 0) {
                      url += `/lesson/${module.lessons[0].slug}`;
                    }
                    navigate(url);
                  }}
                  className={cn(
                    "cursor-pointer my-1",
                    selectedModule.id === module.id &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  {module.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />

          {/* LESSON DROPDOWN */}
          <DropdownMenu open={lessonOpen} onOpenChange={setLessonOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-1 px-2 text-sm font-medium hover:bg-accent"
              >
                <span className="truncate max-w-[200px]">
                  {selectedLesson.title}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform opacity-70",
                    lessonOpen && "rotate-180",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64">
              {selectedModule.lessons.map((lesson) => (
                <DropdownMenuItem
                  key={lesson._id}
                  onClick={() =>
                    navigate(
                      `/course/${course.slug}/module/${selectedModule.slug}/lesson/${lesson.slug}`,
                    )
                  }
                  className={cn(
                    "cursor-pointer my-1",
                    selectedLesson._id === lesson._id &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  {lesson.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
