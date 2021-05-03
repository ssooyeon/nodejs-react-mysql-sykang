import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, UPDATE_LOGGED_USER } from "./types";

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

export const updateLoggedUser = (id) => async (dispatch) => {
  try {
    const res = await UserService.get(id);
    const userStore = localStorage.getItem("user");
    let updateJson = JSON.parse(userStore);
    updateJson.email = res.data.email;
    localStorage.setItem("user", JSON.stringify(updateJson));
    dispatch({
      type: UPDATE_LOGGED_USER,
      payload: updateJson,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err);
  }
};
