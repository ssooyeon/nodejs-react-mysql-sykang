import { combineReducers } from "redux";
import tutorials from "./tutorials"; //TODO: remove
import boards from "./boards";
import users from "./users";
import auth from "./auth";

export default combineReducers({
  tutorials, //TODO: remove
  boards,
  users,
  auth,
});
