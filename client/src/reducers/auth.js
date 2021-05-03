import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, UPDATE_LOGGED_USER } from "actions/types";

// 현재 사용자 가져오기
const user = JSON.parse(localStorage.getItem("user"));
const initialState = user ? { isLoggedIn: true, user } : { isLoggedIn: false, user: null };

function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // 로그인 성공 시 loggedIn과 사용자 정보를 리턴
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: payload.user,
      };

    // 로그인 실패 시 loggedIn를 false로 지정
    case LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

    // 로그인 성공 시 loggedIn를 false로 지정
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

    // 내 정보 수정 시 변경된 정보를 기존 정보에 업데이트하여 리턴
    case UPDATE_LOGGED_USER:
      return {
        ...state,
        isLoggedIn: true,
        user: payload,
      };
    default:
      return state;
  }
}

export default authReducer;
