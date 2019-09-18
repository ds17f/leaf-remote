import { createSession } from './carwings2-js/carwings';
import * as messaging from "../fitbit/messaging";

const LOGIN_START = () => ({type: "API", action: "LOGIN_START"});
const LOGIN_COMPLETE = () => ({type: "API", action: "LOGIN_COMPLETE"});
const LOGIN_FAILED = error => ({type: "API", action: "LOGIN_FAILED", error: error.toString()});

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
