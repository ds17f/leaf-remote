import { createSession } from '../../_lib/carwings/carwings2-js/carwings';
import * as messaging from "../../_lib/fitbit/messaging";
import * as messages from "../../../common/messages/login";

const LOGIN_START = () => Object.assign({}, messages.LOGIN_START);
const LOGIN_COMPLETE = () => Object.assign({}, messages.LOGIN_COMPLETE);
const LOGIN_FAILED = error => Object.assign({error: error.toString()}, messages.LOGIN_FAILED);

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
