import document from "document";
import * as messaging from "app/fitbit/messaging";
import * as vibration from "app/ui/vibration";
import {nextTile} from "app/ui/tiles";

const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
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

export const updateUI = currentState => {
  setCompanionIcon(currentState);
  setConsoleText(currentState);
  setDemoVisible(currentState);
};


