import { login } from "@/actions/user";
import { setUser } from "@/store/slices/user";
import { successToast } from "@/utils/toaster";
import { useAsyncHandler } from "@/utils/async-handler";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type { LoginSchema } from "@/components/login-form";
import { SUCCESS } from "@/api/messages/success";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const asyncHandler = useAsyncHandler();
  const safeLogin = asyncHandler(login);

  const mutation = useMutation({
    mutationFn: (data: LoginSchema) => safeLogin(data),
    onSuccess: (result) => {
      if (!result) return;

      dispatch(setUser(result.data));
      successToast(SUCCESS.LOGIN_SUCCESS);
      navigate("/", { replace: true });
    },
  });

  return {
    loading: mutation.isPending,
    handleLogin: mutation.mutateAsync,
  };
}
