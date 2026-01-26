import { coursesWithStats } from "@/actions/course";
import { useAsyncHandler } from "@/utils/async-handler";
import { useQuery } from "@tanstack/react-query";

export default function useFetchCoursesWithStats() {
  const asyncHandler = useAsyncHandler();
  const safeCoursesWithStats = asyncHandler(coursesWithStats);

  const {
    data: coursesWithStatsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses-with-stats"],
    queryFn: () => safeCoursesWithStats(),
  });

  return {
    coursesWithStatsData,
    isLoading,
    error,
  };
}
