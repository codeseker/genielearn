import { createSlice } from "@reduxjs/toolkit";

interface IInitialState {
  user: null | {
    id: string;
    name: string;
    email: string;
    refreshToken?: string | null;
  };
  token: string | null
}

const initialState: IInitialState = {
  user: null,
  token: null
};

export const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
