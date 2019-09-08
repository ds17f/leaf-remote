import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { sleep } from './utils';
import { createSession, setLogger } from './carwings';

// default to not demo mode
const isDemoMode = () => {
  const demo = settingsStorage.getItem("demo");
  if (typeof demo === 'undefined' || demo === null){
    return false;
  }
  return demo.toLowerCase
    ? demo.toLowerCase() === 'true'
    : demo
};

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

const logger = console;
logger.debug = m => console.log(m);

const sendMessage = (data) => {
  try {
    console.log(`Sending message: ${JSON.stringify(data)}`);
    peerSocket.send(data);
  } catch (error) {
    console.log(`couldn't send "${JSON.stringify(data)}": ${error}`)
  }
};
const sendSettings = () => {
  const settings = {
    debug: settingsStorage.getItem("debug"),
    quiet: settingsStorage.getItem("quiet")
  };
  sendMessage({type: "SETTINGS", settings: settings });
};

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
const setupPeerConnection = () => {

  // Listen for the onmessage event
  peerSocket.onmessage = async evt => {
    console.log(`Received message: ${JSON.stringify(evt.data)}`);
    await parsePeerMessage(evt.data);

    // // Output the message to the console
    // if (evt.data.type === "API") {
    //   switch(evt.data.action) {
    //     case "LOGIN":
    //       nissanLogin();
    //       break;
    //     case "AC_ON":
    //       sendMessage({type: "API", action: "AC_ON"});
    //       console.log("simulate AC_ON");
    //       timer = setInterval(() => {
    //         console.log(`loop: ${loops}`);
    //         if (loops >= MAX_LOOPS ){
    //           clearInterval(timer);
    //           loops = 0;
    //           sendMessage({type: "API", action: "AC_SUCCESS"});
    //           return true;
    //         }
    //         sendMessage({type: "API", action: "AC_POLLING"});
    //       }, 10000);
    //       break;
    //     default:
    //       console.log(`UNKNOWN ACTION: ${evt.data.action}`);
    //       break;
    //   }
    //
    // }
  };

  // Listen for the onopen event
  peerSocket.onopen = () => {
    // Ready to send or receive messages
    console.log("Ready to send/receive");
    sendSettings();
    sendMessage({type: "CONNECT", action: "BEGIN"});
  };

};
const setupSettings = () => {
  logger.debug(`username: ${settingsStorage.getItem("username")}`);
  logger.debug(`password: ${settingsStorage.getItem("password")}`);
  logger.debug(`debug: ${settingsStorage.getItem("debug")}`);
  logger.debug(`quiet: ${settingsStorage.getItem("debug")}`);
  logger.debug(`demo: ${settingsStorage.getItem("demo")}`);
  settingsStorage.onchange = () => {
    sendSettings();
  };
};

const init = () => {
  logger.debug("---- Start Companion ----");
  setupPeerConnection();
  setupSettings();
  console.log(settingsStorage.getItem("apiTimeout"))
};

init();


const nissanLogin = async () => {
  if (isDemoMode()) {
    logger.debug(`demo: ${isDemoMode()}`);
    return await demo_nissanLogin();
  }
  const username = JSON.parse(settingsStorage.getItem("username")).name;
  const password = JSON.parse(settingsStorage.getItem("password")).name;
  console.log(`u: ${username}, p: ${password}`);
  const session = createSession(username, password);

  sendMessage(LOGIN_START);
  try {
    await session.connect();
    sendMessage(LOGIN_COMPLETE);
  } catch (error) {
    const errMessage = Object.assign({error: error}, LOGIN_FAILED);
    sendMessage(errMessage);
    return null;
  }

  return session;
};
const startAC = async () => {
  if (isDemoMode()) {
    logger.debug(`demo: ${isDemoMode()}`);
    return await demo_startAC();
  }
  const POLL_RESULT_INTERVAL = 10000
  const session = await nissanLogin();

  // START
  const resultKey = await session.leafRemote.startClimateControl();
  sendMessage(AC_ON_START);

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
      sendMessage(Object.assign({loop: loop}, AC_ON_POLLING));
      await sleep(POLL_RESULT_INTERVAL);
      climateResult = await session.leafRemote.getStartClimateControlRequest(
        resultKey
      );
      //TODO: Consider a MAX_LOOP
      loop += 1;
    }
    if (isTimeout) {
      sendMessage(Object.assign({timeout: failureTimeoutSeconds}, AC_ON_TIMEOUT));
      logger.warn("Climate Start Failed!!!");
    } else {
      console.debug(`climateResult: ${JSON.stringify(climateResult)}`);
      sendMessage(AC_ON_SUCCESS);
      logger.warn("Climate Start Succeeded!!!");
    }
  } catch (error) {
    sendMessage(Object.assign({result: error}, AC_ON_FAILURE));
    logger.warn("Climate Start Failed!!!");
  }
};
const stopAC = async () => {
  if (isDemoMode()) {
    logger.debug(`demo: ${isDemoMode()}`);
    return await demo_stopAC();
  }
  const POLL_RESULT_INTERVAL = 10000
  const session = await nissanLogin();

  // START
  const resultKey = await session.leafRemote.stopClimateControl();
  sendMessage(AC_ON_START);

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
      sendMessage(Object.assign({loop: loop}, AC_OFF_POLLING));
      await sleep(POLL_RESULT_INTERVAL);
      climateResult = await session.leafRemote.getStopClimateControlRequest(
        resultKey
      );
      //TODO: Consider a MAX_LOOP
      loop += 1;
    }
    if (isTimeout) {
      sendMessage(Object.assign({timeout: failureTimeoutSeconds}, AC_OFF_TIMEOUT));
      logger.warn("Climate Stop Failed!!!");
    } else {
      console.debug(`climateResult: ${JSON.stringify(climateResult)}`);
      sendMessage(AC_OFF_SUCCESS);
      logger.warn("Climate Stop Succeeded!!!");
    }
  } catch (error) {
    sendMessage(Object.assign({result: error}, AC_OFF_FAILURE));
    logger.warn("Climate Stop Failed!!!");
  }
};

const demo_nissanLogin = async () => {
  const username = JSON.parse(settingsStorage.getItem("username")).name;
  const password = JSON.parse(settingsStorage.getItem("password")).name;
  console.log(`u: ${username}, p: ${password}`);
  // const session = createSession(username, password);

  sendMessage(LOGIN_START);
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  const success = Math.random() * 10000 % 100;
  // success 90% of the time
  if (success <= 90) {
    sendMessage(LOGIN_COMPLETE);
  } else {
    const errMessage = Object.assign({error: new Error("Failed because of random")}, LOGIN_FAILED);
    sendMessage(errMessage);
  }

  return {};
};
const demo_startAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  sendMessage(AC_ON_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      sendMessage(AC_ON_SUCCESS);
      return true;
    }
    loop += 1;
    sendMessage(Object.assign({loop: loop}, AC_ON_POLLING));
  }, POLL_RESULT_INTERVAL);
};
const demo_stopAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  sendMessage(AC_OFF_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      sendMessage(AC_OFF_SUCCESS);
      return true;
    }
    loop += 1;
    sendMessage(Object.assign({loop: loop}, AC_OFF_POLLING));
  }, POLL_RESULT_INTERVAL);
};
