import { useNavigate } from "react-router-dom";
import { errorToast } from "@/utils/toaster";
import { useDispatch } from "react-redux";
import { clearUser } from "@/store/slices/user";

export function useAsyncHandler() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  

  return function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
      try {
        return await fn(...args);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        if (msg.includes("Unauthorized") || msg.includes("jwt expired")) {
          dispatch(clearUser());
          navigate("/login", { replace: true });
        }

        errorToast(msg);
        console.error("Async Error:", err);

        return null;
      }
    };
  };
}
