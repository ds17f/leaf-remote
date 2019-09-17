import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { sleep } from './utils';
import { startAC } from "./carwings/startAc"
import { stopAC } from "./carwings/stopAc"

import * as messaging from "./messaging";
import * as settings from "./settings"
import { logger } from "./logger";


const parseAPIMessage = async action => {
  let timer = null;
  let loops = 0;
  const MAX_LOOPS = 3;

  switch(action) {
    case "AC_ON":
      await startAC(settings);
      break;
    case "AC_OFF":
      await stopAC(settings);
      break;
    default:
      logger.error(`Unknown API Action: ${action}`);
      break;
  }

};

const parsePeerMessage = async data => {
  switch (data.type) {
    case "API":
      await parseAPIMessage(data.action);
      break;
    default:
      logger.error(`Unknown message type: ${data.type}`)
  }
};

const init = () => {
  logger.debug("---- Start Companion ----");
  messaging.init();
  settings.init();

  // TODO: externalize this
  peerSocket.addEventListener('message', async (evt) => {
    logger.debug(`Received message: ${JSON.stringify(evt.data)}`);
    await parsePeerMessage(evt.data)
  });
};

init();


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
