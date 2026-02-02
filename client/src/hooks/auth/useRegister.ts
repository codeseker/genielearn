import { register } from "@/actions/user";
import { setUser } from "@/store/slices/user";
import { successToast } from "@/utils/toaster";
import { useAsyncHandler } from "@/utils/async-handler";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RegisterSchema } from "@/components/signup-form";
import { SUCCESS } from "@/api/messages/success";

export function useRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const asyncHandler = useAsyncHandler();
  const safeRegister = asyncHandler(register);

  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(
    async (data: RegisterSchema) => {
      setLoading(true);
      const result = await safeRegister(data);
      setLoading(false);

      if (!result) return;

      dispatch(setUser(result.data));
      successToast(SUCCESS.REGISTER_SUCCESS);
      navigate("/", { replace: true });
    },
    [dispatch, navigate, safeRegister],
  );

  return {
    loading,
    handleRegister,
  };
}
