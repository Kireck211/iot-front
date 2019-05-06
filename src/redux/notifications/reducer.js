import {
  CREATE_NOTIFICAITON,
  DISMISS_NOTIFICATION,
  ACTIVATE_NOTIFICATION
} from "Constants/actionTypes";

const INIT_STATE = {
  notification: null,
  activeNotification: false
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case CREATE_NOTIFICAITON:
      return Object.assign({}, state, {
        notification: action.payload
      });
    case DISMISS_NOTIFICATION:
      return Object.assign({}, state, {
        notification: null,
        activeNotification: false
      });

    case ACTIVATE_NOTIFICATION:
      return Object.assign({}, state, {
        activeNotification: true
      });

    default:
      return { ...state };
  }
};
