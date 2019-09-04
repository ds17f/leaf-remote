import document from "document";
import { peerSocket } from "messaging";
import { vibration } from "haptics";
import { me } from "appbit";
import { display } from "display";
import { writeFileSync, readFileSync, unlinkSync } from "fs";

import { addTouch } from "./lib-fitbit-ui"

const tiles = ["acOn", "acOff", "console"];
const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
};
const state = {
  isDebug: true,
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
const uiLogOut = (msg, ts = null) => {
  const nl = "\n";
  console.log(msg);
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
const logger = {
  log: uiLogOut,
  info: uiLogOut,
  error: uiLogOut,
  debug: uiLogOut
};

const applySettings = settings => {
  // load the debug setting
  if (settings.debug && settings.debug.toLowerCase) {
    state.isDebug = settings.debug.toLowerCase() === "true";
  } else {
    state.isDebug = settings.debug;
  }
};
const writeSettings = (settingsFile = "./settings.json") => {
  const settings = {
    debug: state.isDebug
  };
  writeFileSync(settingsFile, settings, "json");
};
const readSettings = (settingsFile = "./settings.json") => {
  logger.debug("reading settings");
  try {
    const settings = readFileSync(settingsFile, "json");
    applySettings(settings);
  } catch (error) {
    logger.error(`Could not open settingsFile: ${settingsFile} - ${error}`)
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
      sendMessage({type: "API", action: "AC_ON"});
      updateConsole(currentState, "Sending Climate Start Request", "Climate Start");
      break;
    case "acOff":
      sendMessage({type: "API", action: "AC_OFF"});
      updateConsole(currentState, "Sending Climate Stop Request", "Climate Stop");
      break;
    default:
      break
  }
};

const isPeerConnected = () => {
  return peerSocket.readyState === peerSocket.OPEN;
};
const checkPeerConnection = currentState => {
  if (isPeerConnected() ) {
    return true;
  }
  updatePeerConnectUI(currentState);
  state.visibleTile = "console";
  vibration.start("bump");
  updateUI(currentState);
  return false
};

const setVisibleTile = currentState => {
  // fade tiles
  document.getElementsByClassName('tile').forEach(t => {
    t.style.display = "none";
  });

  // fade in proper tile
  document.getElementById(currentState.visibleTile).style.display = "inline";


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
const updateUI = currentState => {
  setVisibleTile(currentState);
  setCompanionIcon(currentState);
  setConsoleText(currentState);
};

const setupPeerConnection = () => {
  logger.debug("Configure peerSocket");
  // Listen for the onopen event
  peerSocket.onopen = () => {
    updatePeerConnectUI(state);
    // notify that the connection is open
    vibration.start("ping");
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
const ensureConnect = () => {
  setTimeout(() => {
    if (! isPeerConnected() ){
      vibration.start("alert");
      updateConsole(state, "Connection failed after 10 seconds");
      setTimeout(() => {
        vibration.stop();
        logger.debug("enable app timeout");
        me.appTimeoutEnabled = true;
      }, 3000);
    }
  }, 10000)
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

const rotateTile = (currentState, forward = true) => {
  if ( checkPeerConnection(currentState) ) {
    // if we're showing the debug console
    // we'll just pretend we're showing the normal console
    if (currentState.visibleTile === "debug") {
      currentState.visibleTile = "console";
    }
    let visibleTileIndex = tiles.indexOf(state.visibleTile);
    visibleTileIndex += forward ? 1 : -1;
    if (visibleTileIndex >= tiles.length) {
      visibleTileIndex = 0;
    } else if (visibleTileIndex < 0) {
      visibleTileIndex = tiles.length - 1;
    }
    state.visibleTile = tiles[visibleTileIndex];
    updateUI(currentState);
    // bump the user
    vibration.start("bump");
    return true;
  }
};

const showDebugLog = currentState => {
  currentState.visibleTile = "debug";
  updateUI(currentState);
};
const updatePeerConnectUI = currentState => {
  if (isPeerConnected()) {
    currentState.companionConnect = "connected";
    currentState.visibleTile = tiles[0];
    updateConsole(currentState, "Peer socket is open");
  } else {
    if (currentState.companionConnect !== "failed") {
      updateConsole(currentState, "Peer socket closed");
    }
    currentState.companionConnect = "failed";
    currentState.visibleTile = "console";
  }
  updateUI(currentState);
};
const updateConsole = (currentState, body, head = null) => {
  currentState.console.bodyText = body;
  currentState.console.headText = head;
  logger.debug(body);
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
          currentState.console.headText = "Connecting";
          updateConsole(currentState, "Logging in to Nissan");
          break;
        case "LOGIN_COMPLETE":
          updateConsole(currentState, "Logged in successfully");
          break;
        case "AC_ON":
          updateConsole(currentState, "Climate Start Initiated");
          powerUp(currentState);
          break;
        case "AC_SUCCESS":
          updateConsole(currentState, "Climate Started Successfully");
          break;
        case "AC_POLLING":
          updateConsole(currentState, `Waiting for Climate Start Status: ${data.loop}`);
          powerUp(currentState);
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
      applySettings(data.settings);
      writeSettings(data.settings);
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
  logger.debug("---- Starting up ----");
  readSettings();
  readLog();
  configureApp();
  setupPeerConnection();
  setupButtons();
  setupTouch();
  ensureConnect();
  logger.debug("Start up complete");
};
init();


