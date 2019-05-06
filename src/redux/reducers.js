import { combineReducers } from "redux";
import settings from "./settings/reducer";
import menu from "./menu/reducer";
import authUser from "./auth/reducer";
import notifications from "./notifications/reducer";

const reducers = combineReducers({
  menu,
  settings,
  authUser,
  notifications
});

export default reducers;
