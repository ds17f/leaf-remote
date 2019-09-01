import document from "document";
import { peerSocket } from "messaging";
import { vibration } from "haptics";
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
  visibleTile: "acOn",
  companionConnect: "notConnected",
  console: {
    headText: "Help",
    bodyText: "This is some help text"
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

const setConnectState = () => {
  if (peerSocket.readyState === peerSocket.OPEN) {
    state.companionConnect = "connected";
  }
  if (peerSocket.readyState === peerSocket.CLOSED) {
    logger.debug("connection is closed");
    state.companionConnect = "failed";
  }
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

  head.text = currentState.console.headText;
  body.text = currentState.console.bodyText;
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
const connectToPeer = () => {
  logger.debug("Connecting to peer");
// Listen for the onopen event
  peerSocket.onopen = function() {
    sendMessage("test");
    setConnectState();
  };

  peerSocket.onerror = function() {
    setConnectState();
  };

// Listen for the onmessage event
  peerSocket.onmessage = function(evt) {

    // Output the message to the console
    const uiConsole = document.getElementById('console');
    uiConsole.text = evt.data;
    logger.debug(JSON.stringify(evt.data));
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
};
const rotateTile = (currentState, forward = true) => {
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
};

const updateUI = currentState => {
  setVisibleTile(currentState);
  setCompanionIcon(currentState);
  setConsoleText(currentState);
};

const init = () => {
  logger.debug("Init start");
  connectToPeer();
  setupButtons();
  setupTouch();
  logger.debug("Init complete");
};
init();
