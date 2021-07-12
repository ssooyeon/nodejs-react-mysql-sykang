import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, UPDATE_LOGGED_USER } from "./types";

import UserService from "services/UserService";

/**
 * 로그인
 */
export const authLogin = (data) => async (dispatch) => {
  try {
    const res = await UserService.getAuthLogin(data);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    if (res.message !== undefined) {
      return Promise.resolve(res.message);
    } else {
      return Promise.resolve(res.data);
    }
  } catch (err) {
    console.log(err);
    dispatch({
      type: LOGIN_FAIL,
    });
    return Promise.reject(err);
  }
};

/**
 * 로그아웃
 */
export const logout = () => (dispatch) => {
  localStorage.removeItem("user");
  localStorage.removeItem("currentFolder");
  dispatch({
    type: LOGOUT,
  });
};

/**
 * 회원정보 수정 시 현재 로그인 사용자 정보 업데이트
 */
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
