import { useNavigate } from "react-router-dom";
import { errorToast } from "@/utils/toaster";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/store/slices/user";
import { refreshUser } from "@/actions/user";
import type { RootState } from "@/store/store";

export function useAsyncHandler() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const auth = useSelector((state: RootState) => state.user);

  return function asyncHandler<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ) {
    return async (
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>> | null> => {
      try {
        return await fn(...args);
      } catch (err: any) {
        const statusCode = err?.response?.status || 500;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong";

        if (statusCode === 401) {
          const result = await refreshUser(auth.user?.refreshToken);

          if (!result.success) {
            dispatch(clearUser());
            navigate("/login");
            return null;
          }

          dispatch(setUser(result.data));

          return await fn(...args);
        }

        errorToast(msg);
        console.error("Async Error:", err);

        return null;
      }
    };
  };
}
