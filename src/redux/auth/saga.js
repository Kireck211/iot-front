import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import Parse from "parse";
import { LOGIN_USER, REGISTER_USER, LOGOUT_USER } from "Constants/actionTypes";

import { loginUserSuccess, registerUserSuccess } from "./actions";
import { createNotification } from "Redux/actions";

const loginWithEmailPasswordAsync = async (email, password) =>
  await Parse.User.logIn(email, password)
    .then(authUser => authUser)
    .catch(error => error);

function* loginWithEmailPassword({ payload }) {
  const { email, password } = payload.user;
  const { history } = payload;
  try {
    const loginUser = yield call(loginWithEmailPasswordAsync, email, password);
    if (loginUser && loginUser.id) {
      localStorage.setItem("user_id", loginUser.id);
      yield put(loginUserSuccess(loginUser));
      history.push("/");
    } else {
      const error = loginUser;
      yield put(createNotification(error));
    }
  } catch (error) {
    // catch throw
    console.log("login error : ", error);
  }
}

const registerWithEmailPasswordAsync = async (email, password) => {
  const user = new Parse.User();
  user.set("email", email);
  user.set("password", password);
  await user
    .signUp()
    .then(authUser => authUser)
    .catch(error => error);
};

function* registerWithEmailPassword({ payload }) {
  const { email, password } = payload.user;
  const { history } = payload;
  try {
    const registerUser = yield call(
      registerWithEmailPasswordAsync,
      email,
      password
    );
    if (!registerUser.message) {
      localStorage.setItem("user_id", registerUser.user.uid);
      yield put(registerUserSuccess(registerUser));
      history.push("/");
    } else {
      // catch throw
      console.log("register failed :", registerUser.message);
    }
  } catch (error) {
    // catch throw
    console.log("register error : ", error);
  }
}

const logoutAsync = async history => {
  await Parse.User.logOut()
    .then(authUser => authUser)
    .catch(error => error);
  history.push("/");
};

function* logout({ payload }) {
  const { history } = payload;
  try {
    yield call(logoutAsync, history);
    localStorage.removeItem("user_id");
  } catch (error) {}
}

export function* watchRegisterUser() {
  yield takeEvery(REGISTER_USER, registerWithEmailPassword);
}

export function* watchLoginUser() {
  yield takeEvery(LOGIN_USER, loginWithEmailPassword);
}

export function* watchLogoutUser() {
  yield takeEvery(LOGOUT_USER, logout);
}

export default function* rootSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser)
  ]);
}
