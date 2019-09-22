import document from "document";
import * as messaging from "../fitbit/messaging";
import * as vibration from "./vibration";
import {nextTile} from "./tiles";

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

const setDemoVisible = currentState => {
  const demoIcon = document.getElementById("demo");
  demoIcon.style.display = currentState.isDemo
    ? "inline"
    : "none";
};

export const updateUI = currentState => {
  setCompanionIcon(currentState);
  setDemoVisible(currentState);
};


