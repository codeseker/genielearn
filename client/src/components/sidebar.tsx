import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAsyncHandler } from "@/utils/async-handler";
import { indexCourses, type MultipleCoursesResponse } from "@/actions/course";
import { setCourses } from "@/store/slices/course";

export default function MySidebar() {
  const { pathname } = useLocation();

  const asyncHandler = useAsyncHandler();
  const safeIndexCourses = asyncHandler(indexCourses);

  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const user = useSelector((state: RootState) => state.user);

  const courses = useSelector(
    (state: RootState) => state.course.courses
  ) as { id: string, title: string }[];
  const getCourses = async (token: string) => {
    const res = await safeIndexCourses(token);

    if (!res?.data) {
      return;

    }
    const data: MultipleCoursesResponse = res?.data;

    const temp = data.courses.map((course) => ({
      id: course.id,
      title: course.title
    }));

    // setCoursesData(temp);
    dispatch(setCourses(temp));

  };
  useEffect(() => {
    if (!user.token) return;

    getCourses(user.token);
  }, [user])

  return (
    <Sidebar className="bg-[#0d0d0d] border-r border-[#1f1f1f]">
      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-gray-400 mb-3">
            My Courses
          </SidebarGroupLabel>

          <div className="mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500"
            />
          </div>


          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {courses && courses.map((item) => {
                const url = '/course/' + item.id;
                const isActive = pathname.startsWith(url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                            ${isActive
                            ? "bg-[#1d1d1d] text-white"
                            : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                          }
                        `}
                      >
                        <BookOpen />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
