import { login } from "@/actions/user";
import { setUser } from "@/store/slices/user";
import { successToast } from "@/utils/toaster";
import { useAsyncHandler } from "@/utils/async-handler";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { LoginSchema } from "@/components/login-form";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const asyncHandler = useAsyncHandler();
  const safeLogin = asyncHandler(login);

  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (data: LoginSchema) => {
      setLoading(true);
      const result = await safeLogin(data);
      setLoading(false);

      if (!result) return;

      dispatch(setUser(result.data));
      successToast("Login successful");
      navigate("/", { replace: true });
    },
    [dispatch, navigate, safeLogin],
  );

  return {
    loading,
    handleLogin,
  };
}
