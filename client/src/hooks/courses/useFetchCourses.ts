import { indexCourses } from "@/actions/course";
import { type ICourseItem } from "@/store/slices/course";
import type { RootState } from "@/store/store";
import { useAsyncHandler } from "@/utils/async-handler";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDebounce } from "../use-debounce";

export default function useCoursesFetch() {
  const asyncHandler = useAsyncHandler();
  const safeIndexCourses = asyncHandler(indexCourses);

  const [search, setSearch] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  const user = useSelector((state: RootState) => state.user);

  const query = useInfiniteQuery({
    queryKey: ["courses", user.user?.id, debouncedSearch],
    enabled: !!user?.token,
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await safeIndexCourses({ page: pageParam, search });

      if (!res?.data) {
        return { courses: [], nextPage: undefined };
      }

      const { courses = [], pagination } = res.data;

      const formatted: ICourseItem[] = courses.map((course) => {
        const module = course.modules?.[0];
        const lesson = module?.lessons?.[0];

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,

          moduleId: module?._id ?? null,
          lessonId: lesson?._id ?? null,

          moduleSlug: module?.slug ?? null,
          lessonSlug: lesson?.slug ?? null,
        };
      });

      const currentPage = pagination?.page ?? pageParam;
      const totalPages = pagination?.totalPages ?? currentPage;

      return {
        courses: formatted,
        nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
      };
    },

    getNextPageParam: (lastPage) => lastPage?.nextPage,
  });

  const courses =
    query.data?.pages.flatMap((page) => page.courses) ?? [];

  return {
    courses,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    search,
    setSearch,
  };
}
