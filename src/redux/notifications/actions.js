import {
  CREATE_NOTIFICAITON,
  DISMISS_NOTIFICATION,
  ACTIVATE_NOTIFICATION
} from "Constants/actionTypes";

export const createNotification = (
  title,
  body,
  notificationType,
  redirect = false
) => ({
  type: CREATE_NOTIFICAITON,
  payload: {
    title,
    body,
    type: notificationType,
    redirect
  }
});

export const dismissNotification = () => ({
  type: DISMISS_NOTIFICATION
});

export const activateNotification = () => ({
  type: ACTIVATE_NOTIFICATION
});
