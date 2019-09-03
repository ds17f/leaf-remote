import document from "document";
import { peerSocket } from "messaging";
import { vibration } from "haptics";
import { me } from "appbit";
import { display } from "display";

import { addTouch } from "./lib-fitbit-ui"

const tiles = ["acOn", "acOff", "console"];
const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
};
const state = {
  isRunning: false,
  visibleTile: "console",
  companionConnect: "notConnected",
  console: {
    headText: null,
    bodyText: null
  }
};

const uiDebug = document.getElementById("console-debug");
const uiLogOut = msg => {
  const nl = "\n";
  console.log(msg);
  const timestamp = new Date().toLocaleTimeString();
  const currentText = uiDebug.text;
  uiDebug.text = `[${timestamp}]${nl}`;
  uiDebug.text += `${msg}${nl}`;
  uiDebug.text += currentText;
};
const logger = {
  log: uiLogOut,
  info: uiLogOut,
  error: uiLogOut,
  debug: uiLogOut
};

const configureApp = () => {
  // TODO: Configure logging
  // TODO: Configure state?

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
      currentState.isRunning = null;
      currentState.console.headText = "Complete";
      currentState.console.bodyText= "I'm done";
      updateUI(currentState);
      vibration.start("nudge");
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
    if (sendMessage("GO")) {
      currentState.isRunning = powerUp(currentState);
      currentState.console.headText = "Run Me";
      currentState.console.bodyText = "I'm running";
      currentState.visibleTile = "console";
      logger.debug("start running");
      vibration.start("confirmation");
      updateUI(currentState);
    }
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
          currentState.console.headText = "Start AC";
          updateConsole(currentState, "Request AC Start");
          break;
        case "AC_SUCCESS":
          updateConsole(currentState, "AC Turned ON");
          break;
        case "AC_POLLING":
          updateConsole(currentState, "Checking AC Start Status");
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
  logger.debug("Init start");
  configureApp();
  setupPeerConnection();
  setupButtons();
  setupTouch();
  ensureConnect();
  logger.debug("Init complete");
};
init();


