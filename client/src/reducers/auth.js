import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, UPDATE_LOGGED_USER } from "actions/types";

const user = JSON.parse(localStorage.getItem("user"));
const initialState = user ? { isLoggedIn: true, user } : { isLoggedIn: false, user: null };

function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        user: payload.user,
      };

    case LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

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
