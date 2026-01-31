import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  LogOut,
  SunMoon,
  User,
  X,
  PlusCircle,
  Search,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import useCoursesFetch from "@/hooks/courses/useFetchCourses";
import { toggleTheme } from "@/store/slices/theme";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/store/slices/user";
import type { RootState } from "@/store/store";
import { getImageUrl } from "@/utils/getImageUrl";
import { MobileHeader } from "./mobile-header";

export function AppSidebar({ mobileTitle }: { mobileTitle?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const user = useSelector((state: RootState) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    courses,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    search,
    setSearch,
  } = useCoursesFetch();

  useEffect(() => {
    const viewport = document.querySelector(
      "[data-radix-scroll-area-viewport]",
    );

    if (!viewport) return;

    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = viewport;

      if (scrollHeight - scrollTop - clientHeight < 80) {
        fetchNextPage();
      }
    };

    viewport.addEventListener("scroll", onScroll);
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleToggleTheme = () => dispatch(toggleTheme());
  const handleLogout = () => dispatch(clearUser());

  return (
    <>
      {!sidebarOpen && (
        <MobileHeader
          title={mobileTitle ?? "Dashboard"}
          onMenuClick={() => setSidebarOpen(true)}
        />
      )}

      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "z-40 h-dvh w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* LOGO */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary shadow-sm">
                <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-primary">
                GenieLearn
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* CREATE COURSE */}
          <div className="p-4 shrink-0">
            <Button
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <PlusCircle className="h-4 w-4" />
              Create New Course
            </Button>
          </div>

          <Separator />

          {/* MIDDLE AREA */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* SEARCH */}
            <div className="p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* COURSES SECTION */}
            <div className="flex-1 min-h-0 flex flex-col px-2 pt-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 shrink-0">
                Your Courses
              </p>

              <ScrollArea className="flex-1 min-h-0 pr-2">
                <div className="space-y-1 pb-4 px-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : courses.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-sidebar-foreground/60">
                      No matching courses
                    </p>
                  ) : (
                    courses.map((course) => {
                      if (!course) return null;

                      const isActive = location.pathname.includes(
                        `/course/${course.slug}`,
                      );

                      return (
                        <Link
                          key={`${course.id}-${course.lessonId}`}
                          to={`/course/${course.slug}/module/${course.moduleSlug}/lesson/${course.lessonSlug}`}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className={cn(
                            "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive &&
                              "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                          )}
                        >
                          <span className="truncate max-w-[170px]">
                            {course.title}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-70" />
                        </Link>
                      );
                    })
                  )}

                  {isFetchingNextPage && (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      Loading more courses...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* PROFILE */}
          {user?.user && (
            <div className="border-t border-sidebar-border p-4 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-14 gap-3 px-3"
                  >
                    {(() => {
                      const { name, email, avatar } = user.user;
                      const avatarUrl = avatar?.url
                        ? getImageUrl(avatar.url)
                        : undefined;

                      const initials =
                        name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U";

                      return (
                        <>
                          <Avatar className="h-9 w-9">
                            {avatarUrl && <AvatarImage src={avatarUrl} />}
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col items-start text-left overflow-hidden">
                            <span className="text-sm font-medium truncate max-w-[140px]">
                              {name || "User"}
                            </span>
                            {email && (
                              <span className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                                {email}
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleToggleTheme}
                    className="flex items-center gap-2"
                  >
                    <SunMoon className="h-4 w-4" />
                    Toggle Theme
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
