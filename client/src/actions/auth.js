import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from "./types";

import UserService from "services/UserService";

export const authLogin = (data) => async (dispatch) => {
  try {
    const res = await UserService.getAuthLogin(data);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    console.log(res.data);
    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("user");
  dispatch({
    type: LOGOUT,
  });
};
