import document from "document";
import * as messaging from "messaging";
import { vibration } from "haptics";
import { addTouch } from "./lib-fitbit-ui"

const output = document.getElementById("console-debug");
const logger = {
  log: m => {
    const nl = "\n";
    console.log(m);
    const timestamp = new Date().toLocaleTimeString();
    const currentText = output.text;
    output.text = `[${timestamp}]${nl}`;
    output.text += `${m}${nl}`;
    output.text += currentText;
  }
};

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

};
const setupButtons = () => {
  document.onkeypress = (e) => {
    if (e.key === "up") {
      logger.log(`up`);
      e.preventDefault();
      fireButton(state);
    }
    if (e.key === "down") {
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
  if ( ! currentState.isRunning ) {
    if (sendMessage("GO")) {
      currentState.isRunning = powerUp(currentState);
      currentState.console.headText = "Run Me";
      currentState.console.bodyText = "I'm running";
      currentState.visibleTile = "console";
      logger.log("start running");
      vibration.start("confirmation");
      updateUI(currentState);
    }
  } else {
    logger.log("already running")
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


setupButtons();
setupTouch();



const setConnectState = () => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    state.companionConnect = "connected";
  }
  if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
    logger.log("connection closed")
    state.companionConnect = "failed";
  }
  updateUI(state);
  return state.companionConnect === "connected";
};

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  sendMessage("test");
  setConnectState();
};

messaging.peerSocket.onerror = function() {
  setConnectState();
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {

  // Output the message to the console
  const uiConsole = document.getElementById('console');
  uiConsole.text = evt.data;
  logger.log(JSON.stringify(evt.data));
};


// Send a message to the peer
const sendMessage = (data) => {
  if ( setConnectState() ) {
    logger.log(`sending: ${JSON.stringify(data)}`);
    messaging.peerSocket.send(data);
    logger.log(`message sent`);
    return true;
  }
  return false;
};
