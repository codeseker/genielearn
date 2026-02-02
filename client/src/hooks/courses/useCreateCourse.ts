import { createCourse } from "@/actions/course";
import { SUCCESS } from "@/api/messages/success";
import { useAsyncHandler } from "@/utils/async-handler";
import { successToast } from "@/utils/toaster";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateCourse() {
  const asyncHandler = useAsyncHandler();
  const safeCreateCourse = asyncHandler(createCourse);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["create-course"],
    mutationFn: async (prompt: string) => {
      return safeCreateCourse({ prompt });
    },
    onSuccess: () => {
      successToast(SUCCESS.COURSE_CREATE_SUCCESS);
      queryClient.invalidateQueries({ queryKey: ["courses-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return mutation;
}
