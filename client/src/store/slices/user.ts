import { SUCCESS } from "@/api/messages/success";
import { successToast } from "@/utils/toaster";
import { createSlice } from "@reduxjs/toolkit";

interface IInitialState {
  user: null | {
    id: string;
    name: string;
    email: string;
    refreshToken?: string | null;
    avatar?: {
      _id: string;
      url: string;
    } | null;
  };
  token: string | null;
}

const initialState: IInitialState = {
  user: null,
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      successToast(SUCCESS.LOGOUT_SUCCESS);
    },
    setAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setAvatar } = userSlice.actions;
export default userSlice.reducer;
