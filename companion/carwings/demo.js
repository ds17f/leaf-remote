import {settingsStorage} from "settings";

import * as messaging from "../fitbit/messaging";
import {sleep} from "../lib/utils";
import {logger} from "../lib/logger";

const demo_nissanLogin = async () => {
  const username = JSON.parse(settingsStorage.getItem("username")).name;
  const password = JSON.parse(settingsStorage.getItem("password")).name;
  console.log(`u: ${username}, p: ${password}`);
  // const session = createSession(username, password);

  messaging.send(LOGIN_START);
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  const success = Math.random() * 10000 % 100;
  // success 90% of the time
  if (success <= 90) {
    messaging.send(LOGIN_COMPLETE);
  } else {
    const errMessage = Object.assign({error: new Error("Failed because of random")}, LOGIN_FAILED);
    messaging.send(errMessage);
  }

  return {};
};
const demo_startAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  messaging.send(AC_ON_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      messaging.send(AC_ON_SUCCESS);
      return true;
    }
    loop += 1;
    messaging.send(Object.assign({loop: loop}, AC_ON_POLLING));
  }, POLL_RESULT_INTERVAL);
};
const demo_stopAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  messaging.send(AC_OFF_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      messaging.send(AC_OFF_SUCCESS);
      return true;
    }
    loop += 1;
    messaging.send(Object.assign({loop: loop}, AC_OFF_POLLING));
  }, POLL_RESULT_INTERVAL);
};