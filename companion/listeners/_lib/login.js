import { createSession } from './carwings2-js/carwings';
import * as messaging from "../fitbit/messaging";
import * as actions from "../../common/actions/login";

const LOGIN_START = () => Object.assign({}, actions.LOGIN_START);
const LOGIN_COMPLETE = () => Object.assign({}, actions.LOGIN_COMPLETE);
const LOGIN_FAILED = error => Object.assign({error: error.toString()}, actions.LOGIN_FAILED);

export const nissanLogin = async (username, password) => {
  const session = createSession(username, password);

  messaging.send(LOGIN_START());
  try {
    await session.connect();
    messaging.send(LOGIN_COMPLETE());
  } catch (error) {
    messaging.send(LOGIN_FAILED(error));
  }

  return session;
};
