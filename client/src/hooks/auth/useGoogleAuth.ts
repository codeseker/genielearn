import { googleAuth } from "@/actions/user";
import { SUCCESS } from "@/api/messages/success";
import { setUser } from "@/store/slices/user";
import { useAsyncHandler } from "@/utils/async-handler";
import { successToast } from "@/utils/toaster";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function useGoogleAuth() {
  const asyncHandler = useAsyncHandler();
  const safeGoogleAuth = asyncHandler(googleAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ["google-auth"],
    mutationFn: async (code: string) => {
      return safeGoogleAuth(code);
    },
    onSuccess: (result) => {
      if (!result) return;

      dispatch(setUser(result.data));
      successToast(SUCCESS.LOGIN_SUCCESS);
      navigate("/", { replace: true });
    },
  });

  return mutation;
}
