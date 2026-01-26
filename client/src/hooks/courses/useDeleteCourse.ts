import { deleteCourse } from "@/actions/course";
import { useAsyncHandler } from "@/utils/async-handler";
import { successToast } from "@/utils/toaster";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function useDeleteCourse() {
  const asyncHandler = useAsyncHandler();
  const safeCouseDelete = asyncHandler(deleteCourse);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["delete-course"],
    mutationFn: async (courseId: string) => {
      return safeCouseDelete({ courseId });
    },
    onSuccess: () => {
      successToast("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["courses-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return mutation;
}
