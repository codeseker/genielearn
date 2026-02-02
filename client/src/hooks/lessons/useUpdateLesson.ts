import { updateLesson } from "@/actions/lesson";
import { useAsyncHandler } from "@/utils/async-handler";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { LessonParams } from "./useFetchLesson";
import { useParams } from "react-router-dom";
import { SUCCESS } from "@/api/messages/success";

export default function useUpdateLesson() {
  const { courseId, moduleId, lessonId } = useParams<LessonParams>();
  const asyncHandler = useAsyncHandler();
  const safeUpdateLesson = asyncHandler(updateLesson);

  let flag = false;

  const updateLessonMutation = useMutation({
    mutationKey: ["update-lesson", courseId, moduleId, lessonId],
    mutationFn: (complete: boolean) => {
      flag = complete;
      return safeUpdateLesson({
        courseId: courseId!,
        moduleId: moduleId!,
        lessonId: lessonId!,
        complete,
      });
    },
    onSuccess: (_data, complete) => {
      toast.success(
        complete
          ? SUCCESS.LESSON_MARK_AS_COMPLETE
          : SUCCESS.LESSON_MARK_AS_INCOMPLETE,
      );
    },
    onError: (error) => {
      // toast.error(error.message);
    },
  });

  return updateLessonMutation;
}
