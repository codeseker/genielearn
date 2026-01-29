import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { getImageUrl } from "@/utils/getImageUrl";
import useFetchCoursesWithStats from "@/hooks/courses/useFetchCoursesWithStats";
import useDeleteCourse from "@/hooks/courses/useDeleteCourse";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const stateUser = useSelector((state: RootState) => state.user);
  const [loading] = useState(false);

  console.log("USER: ", stateUser);

  const user = {
    name: stateUser.user?.name,
    email: stateUser.user?.email,
    avatar: stateUser.user?.avatar?.url
      ? getImageUrl(stateUser.user?.avatar?.url)
      : "",
  };

  const { coursesWithStatsData, isLoading, error } = useFetchCoursesWithStats();
  const { mutateAsync: deleteCourse, isPending: deleteCoursePending } =
    useDeleteCourse();

  if (isLoading) {
    return <Skeleton className="h-28 w-28 rounded-full" />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourse(courseId);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      <h1 className="text-3xl font-bold tracking-tight max-md:pl-8 max-md:mb-3">
        Profile
      </h1>

      {/* PROFILE HEADER */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
          {loading ? (
            <Skeleton className="h-28 w-28 rounded-full" />
          ) : (
            <Avatar className="h-28 w-28 ring-4 ring-background shadow-md">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
          )}

          <div className="flex-1 text-center md:text-left space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold tracking-tight">
                  {user.name}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
              </>
            )}

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-3">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="secondary" size="sm" asChild>
                  <span>Change Avatar</span>
                </Button>
              </Label>
              <Input id="avatar-upload" type="file" className="hidden" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Courses", value: 2 },
          { label: "Completed", value: 1 },
          { label: "In Progress", value: 1 },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-border/60 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* COURSES */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Your Courses
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {coursesWithStatsData?.data?.courses.map((course) => (
                <AccordionItem
                  key={course.id}
                  value={`course-${course.id}`}
                  className="group rounded-xl border border-border/60 bg-card hover:bg-accent/40 transition-colors"
                >
                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {course.title}
                    </AccordionTrigger>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex-1 md:w-48">
                        <Progress value={course.stats.progress} />
                      </div>

                      <Badge variant="secondary" className="font-medium">
                        {course.stats.progress}%
                      </Badge>

                      <Button
                        onClick={() => handleDeleteCourse(course.slug)}
                        variant="ghost"
                        disabled={deleteCoursePending}
                        size="sm"
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        {deleteCoursePending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>

                  <AccordionContent className="px-5 pb-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      {course.modules.map((module, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border/60 bg-muted/40 p-4"
                        >
                          <p className="font-semibold mb-2">{module.title}</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {module.lessons.map((lesson, i) => (
                              <li key={i}>• {lesson.title}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
