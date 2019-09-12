import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { sleep } from './utils';
import { createSession, setLogger } from './carwings';

import * as messaging from "./messaging";
import * as settings from "./settings"
import { logger } from "./logger";


const LOGIN_START = {type: "API", action: "LOGIN_START"};
const LOGIN_COMPLETE = {type: "API", action: "LOGIN_COMPLETE"};
const LOGIN_FAILED = {type: "API", action: "LOGIN_FAILED"};

const AC_ON_START = {type: "API", action: "AC_ON_START"};
const AC_ON_POLLING = {type: "API", action: "AC_ON_POLLING"};
const AC_ON_SUCCESS = {type: "API", action: "AC_ON_SUCCESS"};
const AC_ON_TIMEOUT = {type: "API", action: "AC_ON_TIMEOUT"};
const AC_ON_FAILURE = {type: "API", action: "AC_ON_FAILURE"};

const AC_OFF_START = {type: "API", action: "AC_OFF_START"};
const AC_OFF_POLLING = {type: "API", action: "AC_OFF_POLLING"};
const AC_OFF_SUCCESS = {type: "API", action: "AC_OFF_SUCCESS"};
const AC_OFF_TIMEOUT = {type: "API", action: "AC_OFF_TIMEOUT"};
const AC_OFF_FAILURE = {type: "API", action: "AC_OFF_FAILURE"};


const parseAPIMessage = async action => {
  let timer = null;
  let loops = 0;
  const MAX_LOOPS = 3;

  switch(action) {
    case "LOGIN":
      await nissanLogin();
      break;
    case "AC_ON":
      await startAC();
      break;
    case "AC_OFF":
      await stopAC();
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

  // messaging.setupPeerConnection(() => {
  //   messaging.send(messaging.CONNECT_BEGIN());
  // }, parsePeerMessage);

  messaging.init();
  settings.init();
  console.log(settings.companion.apiTimeout)
};

init();


const nissanLogin = async () => {
  if (settings.companion.demo) {
    logger.debug(`demo: ${settings.companion.demo}`);
    return await demo_nissanLogin();
  }
  const username = JSON.parse(settingsStorage.getItem("username")).name;
  const password = JSON.parse(settingsStorage.getItem("password")).name;
  console.log(`u: ${username}, p: ${password}`);
  const session = createSession(username, password);

  messaging.send(LOGIN_START);
  try {
    await session.connect();
    messaging.send(LOGIN_COMPLETE);
  } catch (error) {
    const errMessage = Object.assign({error: error}, LOGIN_FAILED);
    messaging.send(errMessage);
    return null;
  }

  return session;
};
const startAC = async () => {
  if (settings.companion.demo) {
    logger.debug(`demo: ${settings.companion.demo}`);
    return await demo_startAC();
  }
  const POLL_RESULT_INTERVAL = 10000
  const session = await nissanLogin();

  // START
  const resultKey = await session.leafRemote.startClimateControl();
  messaging.send(AC_ON_START);

  let climateResult = await session.leafRemote.getStartClimateControlRequest(
    resultKey
  );

  /* eslint-disable no-await-in-loop */
  let loop = 1;
  let isTimeout = false;

  const failureTimeoutSeconds = settingsStorage.getItem("apiTimeout")
    ? JSON.parse(settingsStorage.getItem("apiTimeout")).name
    : 300;
  console.log(`Timeout: ${failureTimeoutSeconds}`);

  let timeout = setTimeout(() => {
    isTimeout = true;
  }, failureTimeoutSeconds * 1000);

  try {
    while (!climateResult && !isTimeout) {
      logger.warn(
        `Climate start result not ready yet.  Sleeping: ${POLL_RESULT_INTERVAL /
        1000} seconds`
      );
      messaging.send(Object.assign({loop: loop}, AC_ON_POLLING));
      await sleep(POLL_RESULT_INTERVAL);
      climateResult = await session.leafRemote.getStartClimateControlRequest(
        resultKey
      );
      //TODO: Consider a MAX_LOOP
      loop += 1;
    }
    if (isTimeout) {
      messaging.send(Object.assign({timeout: failureTimeoutSeconds}, AC_ON_TIMEOUT));
      logger.warn("Climate Start Failed!!!");
    } else {
      console.debug(`climateResult: ${JSON.stringify(climateResult)}`);
      messaging.send(AC_ON_SUCCESS);
      logger.warn("Climate Start Succeeded!!!");
    }
  } catch (error) {
    messaging.send(Object.assign({result: error}, AC_ON_FAILURE));
    logger.warn("Climate Start Failed!!!");
  }
};
const stopAC = async () => {
  if (settings.companion.demo) {
    logger.debug(`demo: ${settings.companion.demo}`);
    return await demo_stopAC();
  }
  const POLL_RESULT_INTERVAL = 10000
  const session = await nissanLogin();

  // START
  const resultKey = await session.leafRemote.stopClimateControl();
  messaging.send(AC_ON_START);

  let climateResult = await session.leafRemote.getStopClimateControlRequest(
    resultKey
  );

  /* eslint-disable no-await-in-loop */
  let loop = 1;
  let isTimeout = false;

  const failureTimeoutSeconds = settingsStorage.getItem("apiTimeout")
    ? JSON.parse(settingsStorage.getItem("apiTimeout")).name
    : 300;
  console.log(`Timeout: ${failureTimeoutSeconds}`);

  let timeout = setTimeout(() => {
    isTimeout = true;
  }, failureTimeoutSeconds * 1000);

  try {
    while (!climateResult && !isTimeout) {
      logger.warn(
        `Climate stop result not ready yet.  Sleeping: ${POLL_RESULT_INTERVAL /
        1000} seconds`
      );
      messaging.send(Object.assign({loop: loop}, AC_OFF_POLLING));
      await sleep(POLL_RESULT_INTERVAL);
      climateResult = await session.leafRemote.getStopClimateControlRequest(
        resultKey
      );
      //TODO: Consider a MAX_LOOP
      loop += 1;
    }
    if (isTimeout) {
      messaging.send(Object.assign({timeout: failureTimeoutSeconds}, AC_OFF_TIMEOUT));
      logger.warn("Climate Stop Failed!!!");
    } else {
      console.debug(`climateResult: ${JSON.stringify(climateResult)}`);
      messaging.send(AC_OFF_SUCCESS);
      logger.warn("Climate Stop Succeeded!!!");
    }
  } catch (error) {
    messaging.send(Object.assign({result: error}, AC_OFF_FAILURE));
    logger.warn("Climate Stop Failed!!!");
  }
};

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
