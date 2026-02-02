import { useMemo } from "react";
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
import { Loader2, BookOpen, Trophy, Clock, Upload } from "lucide-react";
import useAvatarUpload from "@/hooks/user/useAvatarUpload";

export default function Profile() {
  const stateUser = useSelector((state: RootState) => state.user);

  const user = {
    name: stateUser.user?.name,
    email: stateUser.user?.email,
    avatar: stateUser.user?.avatar?.url
      ? getImageUrl(stateUser.user?.avatar?.url)
      : "",
  };

  console.log("USER: ", user);

  const { coursesWithStatsData, isLoading, error } = useFetchCoursesWithStats();
  const { mutateAsync: deleteCourse, isPending: deleteCoursePending } =
    useDeleteCourse();
  const { handleFileChange } = useAvatarUpload();

  const courses = coursesWithStatsData?.data?.courses || [];

  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.stats.progress === 100).length;
    const inProgress = courses.filter(
      (c) => c.stats.progress > 0 && c.stats.progress < 100,
    ).length;

    return [
      { label: "Total Courses", value: total, icon: BookOpen },
      { label: "Completed", value: completed, icon: Trophy },
      { label: "In Progress", value: inProgress, icon: Clock },
    ];
  }, [courses]);

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourse(courseId);
  };

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6 text-foreground">
      {/* PAGE TITLE */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and track your learning progress
        </p>
      </div>

      {/* PROFILE HEADER */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
          {isLoading ? (
            <Skeleton className="h-28 w-28 rounded-full" />
          ) : (
            <Avatar className="h-28 w-28 shadow-md rounded-full overflow-hidden">
              {user.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-2xl flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  {user.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
          )}

          <div className="flex-1 text-center md:text-left space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-52" />
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

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
              {/* Hidden file input */}
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Trigger */}
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  asChild
                  size="sm"
                  className="
        flex items-center gap-2
        rounded-md
        bg-primary text-primary-foreground
        shadow-sm
        transition-all
        hover:bg-primary/90 hover:shadow-md
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      "
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    Change Avatar
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="border-border/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* COURSES */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Your Courses
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 p-5 space-y-3"
                >
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ))}
            </>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No courses yet. Start learning to see progress here.
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {courses.map((course) => (
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
                        className="text-destructive hover:text-destructive"
                      >
                        {deleteCoursePending ? (
                          <Loader2 className="animate-spin h-4 w-4" />
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
