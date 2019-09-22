import * as settings from './fitbit/settings';
import * as messaging from './fitbit/messaging'
import * as vibration from './ui/vibration';
import * as _tiles from './ui/tiles';
import * as uiConsole from './ui/console';
import * as actions from './actions'

import document from "document";
import { peerSocket } from "messaging";
import { me } from "appbit";
import { writeFileSync, readFileSync, unlinkSync } from "fs";

import { addTouch } from "./lib-fitbit-ui"

import { logger, levels, setLogLevel } from "../common/logger";

const tiles = ["acOn", "acOff", "console"];
const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
};
const state = {
  isDebug: true,
  isQuiet: false,
  isDemo: false,
  isRunning: false,
  visibleTile: "console",
  companionConnect: "notConnected",
  console: {
    headText: null,
    bodyText: null
  }
};

const log = [];
const uiDebug = document.getElementById("console-debug");
const clearLog = () => {
  log.length = 0;
  uiDebug.text = "";
};
const deleteLog = (logFile = "./log.txt") => {
  unlinkSync(logFile);
};
const writeLog = (logFile = "./log.txt") => {
  writeFileSync(logFile, log, "json");
};
const readLog = (logFile = "./log.txt") => {
  if (! state.isDebug) {
    return;
  }
  try {
    const fileLog = readFileSync(logFile, "json");
    const currentLog = log.splice(0);
    clearLog();
    fileLog.forEach(l => logger.debug(l.message, l.timestamp))
    currentLog.forEach(l => logger.debug(l.message, l.timestamp))
  } catch (error) {
    logger.error(`Could not open logfile: ${logFile} - ${error}`)
  }
};
const uiInfoOut = (body) => {
  state.console.bodyText = body;
  updateUI(state);
};
const uiDebugOut = (msg, ts = null) => {
  const nl = "\n";
  const timestamp = ts ? ts : new Date().toTimeString();
  log.push({timestamp: timestamp, message: msg});
  try {
    const currentText = uiDebug.text;
    uiDebug.text = `[${timestamp}]${nl}`;
    uiDebug.text += `${msg}${nl}`;
    uiDebug.text += currentText;
  } catch (error) {
    console.error(`Failed to write log message to console: ${msg}`)
  }
};
const oldLogger = {
  error: (msg, ts) => {
    console.error(msg);
    uiDebugOut(msg, ts);
    uiInfoOut(msg);
    vibration.vibrateFailure();
  },
  warn: (msg, ts) => {
    console.warn(msg);
    uiDebugOut(msg, ts);
    uiInfoOut(msg);
    vibration.vibrateSuccess();
  },
  info: (msg, ts) => {
    console.info(msg);
    uiDebugOut(msg, ts);
    uiInfoOut(msg);
    vibration.vibrateInfo(state.isQuiet);
  },
  debug: (msg, ts) => {
    console.log(msg);
    uiDebugOut(msg, ts);
  },
  log: (msg, ts) => {
    console.log(msg);
    uiDebugOut(msg, ts);
  }
};

const applySettings = settings => {
  // load the debug setting
  state.isDebug = settings.debug;
  state.isQuiet = settings.quiet;
  if (state.isDemo !== settings.demo){
    state.isDemo = settings.demo;
    updateUI(state);
  } else {
    state.isDemo = settings.demo;
  }
};

const configureApp = () => {
  // TODO: Configure logging
  // TODO: Configure state?
  me.addEventListener("unload", () => {
    logger.debug("---- Shutting down ----");
    writeSettings();
    if (state.isDebug) {
      writeLog();
    } else {
      deleteLog();
    }
  });
  logger.debug("disable app timeout");
  me.appTimeoutEnabled = false;
};
const sendMessage = data => {
  if ( checkPeerConnection(state)) {
    logger.debug(`sending: ${JSON.stringify(data)}`);
    try {
      peerSocket.send(data);
    } catch (error) {
      logger.error(error);
      return false;
    }
    logger.debug(`message sent`);
    return true;
  }
  return false;
};
const sendAPIRequest = currentState => {
  switch (currentState.visibleTile) {
    case "acOn":
      currentState.console.headText = "Climate Start";
      logger.info("Sending Climate Start Request");
      sendMessage({type: "API", action: "AC_ON"});
      break;
    case "acOff":
      currentState.console.headText = "Climate Stop";
      logger.info("Sending Climate Stop Request");
      sendMessage({type: "API", action: "AC_OFF"});
      break;
    default:
      break
  }
};

const checkPeerConnection = currentState => {
  if (messaging.isPeerConnected() ) {
    return true;
  }
  updatePeerConnectUI(currentState);
  state.visibleTile = "console";
  vibration.vibrateFailure();
  updateUI(currentState);
  return false
};

const setCompanionIcon = currentState => {
  const iconMask = document.getElementById('icon-mask').getElementsByTagName('rect')[0];
  iconMask.x = icons[currentState.companionConnect];
};
const setConsoleText = currentState => {
  const head = document.getElementById("console-head");
  const body = document.getElementById("console-body");

  // only change if the value is not null
  // set to "" to clear a field instead of null
  if (currentState.console.headText !== null) {
    head.text = currentState.console.headText;
  }
  if (currentState.console.bodyText!== null) {
    body.text = currentState.console.bodyText;
  }
};
const setDemoVisible = currentState => {
  const demoIcon = document.getElementById("demo");
  demoIcon.style.display = currentState.isDemo
    ? "inline"
    : "none";
};
const updateUI = currentState => {
  setCompanionIcon(currentState);
  setConsoleText(currentState);
  setDemoVisible(currentState);
};

const setupPeerConnection = () => {
  logger.debug("Configure peerSocket");
  // Listen for the onopen event
  peerSocket.onopen = () => {
    updatePeerConnectUI(state);
    // notify that the connection is open
    vibration.vibrateSuccess();
  };

  peerSocket.onerror = () => {
    updatePeerConnectUI(state)
  };

  // Listen for the onmessage event
  peerSocket.onmessage = function(evt) {
    logger.debug(`Received message: ${JSON.stringify(evt.data)}`);
    parseCompanionMessage(state, evt.data);
  };

};
const setupTouch = () => {
  const app = document.getElementById("app");
  const nextTile = () => {
    rotateTile(state, true)
  };
  const prevTile = () => {
    rotateTile(state, false)
  };
  const clickTile = () => {
    switch (state.visibleTile) {
      case "acOn":
        fireButton(state);
        break;
      case "acOff":
        fireButton(state);
        break;
      case "console":
        showDebugLog(state);
        break;
      case "debug":
        break;

      default:
        break;
    }
  };

  addTouch(app, clickTile, nextTile, prevTile);

  addTouch(document.getElementById("debug"), null, nextTile, prevTile);

};
const setupButtons = () => {
  document.onkeypress = (e) => {
    if (e.key === "up") {
      e.preventDefault();
      fireButton(state);
    }
    if (e.key === "down") {
      e.preventDefault();
      rotateTile(state);
    }
    if (e.key === "back" && state.visibleTile === "debug") {
      e.preventDefault();
      clearLog();
      logger.debug("log cleared");
    }
  };
};
const ensureConnect = (timeOut = 10) => {
  setTimeout(() => {
    if (! messaging.isPeerConnected() ){
      logger.error(`Connection failed after ${timeOut} seconds`);

      logger.debug("enable app timeout");
      me.appTimeoutEnabled = true;
    }
  }, timeOut * 1000)
};

const powerUp = currentState => {
  const powerMask = document.getElementById('power-mask').getElementsByTagName("rect")[0];

  const START = 130;
  const MAX = 300;
  const STEP = 18;

  let iter = 0;
  powerMask.width = START;
  const f = setInterval(() => {
    let step = STEP;
    if (iter >= 8) {
      clearInterval(f);
      powerMask.width = 0;
      // currentState.isRunning = null;
      // currentState.console.headText = "Complete";
      // currentState.console.bodyText= "I'm done";
      updateUI(currentState);
      // vibration.start("nudge");
      return;
    }
    if (iter >= 6) {
      step = 27;
    }

    if (powerMask.width >= MAX) {
      powerMask.width = START;
    } else {
      powerMask.width += step;
    }
    iter += 1;
  }, 1000);

  return f;
};
const fireButton = currentState => {
  if (checkPeerConnection(currentState)) {
    if ( ! currentState.isRunning ) {
      sendAPIRequest(currentState);
      currentState.visibleTile = "console";
      updateUI(currentState);


      // if (sendMessage("GO")) {
      //   currentState.isRunning = powerUp(currentState);
      //   currentState.console.headText = "Run Me";
      //   currentState.console.bodyText = "I'm running";
      //   currentState.visibleTile = "console";
      //   logger.debug("start running");
      //   vibration.start("confirmation");
      //   updateUI(currentState);
      // }
    } else {
      logger.debug("already running")
    }
  }
};

const showDebugLog = currentState => {
  currentState.visibleTile = "debug";
  updateUI(currentState);
};
const updatePeerConnectUI = currentState => {
  if (messaging.isPeerConnected()) {
    currentState.companionConnect = "connected";
    currentState.visibleTile = tiles[0];
    logger.info("Peer socket is open");
  } else {
    if (currentState.companionConnect !== "failed") {
      logger.error("Peer socket closed");
    }
    currentState.companionConnect = "failed";
    currentState.visibleTile = "console";
  }
  updateUI(currentState);
};

const parseCompanionMessage = (currentState, data) => {
  // if ( ! data && ! data.type ) {
  //   logger.debug(`Message: ${JSON.stringify(data)} does not have "type" property}`)
  //   return false;
  // }

  switch (data.type) {
    case "API": {
      switch (data.action) {

        case "LOGIN_START":
          logger.info("Logging in to Nissan");
          break;
        case "LOGIN_COMPLETE":
          logger.info("Logged in successfully");
          break;
        case "LOGIN_FAILED":
          logger.error(`Login failed: ${data.error}`);
          break;

        case "AC_ON_START":
          logger.info("Start sent, awaiting result.");
          // powerUp(currentState);
          break;
        case "AC_ON_SUCCESS":
          logger.warn("Climate Started Successfully");
          break;
        case "AC_ON_TIMEOUT":
          logger.warn(`Climate Start Failed after: ${data.timeout} seconds.`);
          break;
        case "AC_ON_FAILURE":
          logger.warn(`Climate Start Failed with: ${data.result}.`);
          break;
        case "AC_ON_POLLING":
          logger.info(`Awaiting result, loop: ${data.loop}`);
          // powerUp(currentState);
          break;

        case "AC_OFF_START":
          logger.info("Stop sent, awaiting result.");
          // powerUp(currentState);
          break;
        case "AC_OFF_SUCCESS":
          logger.warn("Climate Stopped Successfully");
          break;
        case "AC_OFF_TIMEOUT":
          logger.warn(`Climate Stop Failed after: ${data.timeout} seconds.`);
          break;
        case "AC_OFF_FAILURE":
          logger.warn(`Climate Stop Failed with: ${data.result}.`);
          break;
        case "AC_OFF_POLLING":
          logger.info(`Awaiting result, loop: ${data.loop}`);
          // powerUp(currentState);
          break;

        default:
          logger.error(`Unknown api action: ${data.action}`);
          break;
      }
      break;
    }
    case "CONNECT": {
      switch (data.action) {
        case "BEGIN":
          break;
        case "END":
          break;
      }
      break;
    }
    case "DEBUG": {
      logger.debug(data.message);
      break;
    }
    case "SETTINGS":
      // TODO: Remove this when we're ready as it's handled elsewhere
      break;
    default:
      logger.error(`Unknown companion message type: ${JSON.stringify(data)}`);
      break;
  }
};

const apiLogin = () => {
  sendMessage({
    type: "API",
    action: "LOGIN"
  })
};

const init = () => {
  setLogLevel(levels.DEBUG);
  logger.warn("---- Starting up ----");

  settings.init(applySettings);
  messaging.init();
  actions.init();

  _tiles.init();
  uiConsole.init();

  return;

  readLog();
  configureApp();
  setupPeerConnection();
  setupButtons();
  setupTouch();
  ensureConnect(20);
  logger.debug("Start up complete");
};
init();


