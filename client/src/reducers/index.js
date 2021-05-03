import { combineReducers } from "redux";
import tutorials from "./tutorials";
import boards from "./boards";
import users from "./users";
import auth from "./auth";

export default combineReducers({
  tutorials,
  boards,
  users,
  auth,
});
