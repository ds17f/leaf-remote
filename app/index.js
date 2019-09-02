import document from "document";
import { peerSocket } from "messaging";
import { vibration } from "haptics";
import { me } from "appbit";
import { display } from "display";

import { addTouch } from "./lib-fitbit-ui"

const tiles = ["acOn", "acOff", "console", "debug"];
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
  logger.debug("keep screen on");
  display.autoOff = false;
};

const setConnectState = () => {
  if (peerSocket.readyState === peerSocket.OPEN) {
    state.companionConnect = "connected";
    state.visibleTile = tiles[0];
    updateConsole(state, "Peer app connected!");
  }
  if (peerSocket.readyState === peerSocket.CLOSED) {
    logger.debug("connection is closed");
    state.companionConnect = "failed";
    state.visibleTile = "console";
    updateConsole(state, "Peer app failed to connect");
  }
  //TODO: this is redundant as updateConsole currently calls
  updateUI(state);

  return state.companionConnect === "connected";
};
const sendMessage = data => {
  if ( setConnectState() ) {
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
const connectToPeer = () => {
  logger.debug("Connecting to peer");
  // Listen for the onopen event
  peerSocket.onopen = function() {
    setConnectState();
  };

  peerSocket.onerror = function() {
    setConnectState();
  };

  // Listen for the onmessage event
  peerSocket.onmessage = function(evt) {
    logger.debug(`Received message: ${JSON.stringify(evt.data)}`);
    parseCompanionMessage(state, evt.data);
  };

};
const checkPeerConnection = currentState => {
  if (currentState.companionConnect === "connected") {
    return true;
  }
  state.visibleTile = "console";
  state.console.bodyText = "Peer app is not connected";
  vibration.start("bump");
  updateUI(currentState);
  return false;
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

const setupTouch = () => {
  const app = document.getElementById("app");
  const nextTile = () => {
    rotateTile(state, true)
  };
  const prevTile = () => {
    rotateTile(state, false)
  };
  const clickTile = () => {
    fireButton(state);
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

const updateConsole = (currentState, body, head = null) => {
  currentState.console.bodyText = body;
  currentState.console.headText = head;
  logger.debug(body);
  updateUI(currentState);
};
const updateUI = currentState => {
  setVisibleTile(currentState);
  setCompanionIcon(currentState);
  setConsoleText(currentState);
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
  connectToPeer();
  setupButtons();
  setupTouch();
  logger.debug("Init complete");
};
init();


