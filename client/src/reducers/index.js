import { combineReducers } from "redux";
import boards from "./boards";
import users from "./users";
import auth from "./auth";

export default combineReducers({
  boards,
  users,
  auth,
});
