import document from "document";
import { peerSocket } from "messaging";
import { me } from "appbit";

import * as settings from './_lib/fitbit/settings';
import * as messaging from './_lib/fitbit/messaging'

import * as tiles from './ui/tiles';
import * as peerConnection from './ui/peerConnection';
import * as actions from './actions';
import * as listeners from './listeners';

import { logger, levels, setLogLevel } from "../common/logger";

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

const ensureConnect = (timeOut = 10) => {
  setTimeout(() => {
    if (! messaging.isPeerConnected() ){
      logger.error(`Connection failed after ${timeOut} seconds`);

      logger.debug("enable app timeout");
      me.appTimeoutEnabled = true;
    }
  }, timeOut * 1000)
};

const init = () => {
  setLogLevel(levels.TRACE);
  logger.warn("---- Starting up ----");

  //TODO: Don't think we need the callback so right now just print it out
  settings.init(s => logger.trace(`Settings callback: ${JSON.stringify(s)}`));
  messaging.init();
  actions.init();
  listeners.init();

  tiles.init();
  peerConnection.init();

  ensureConnect(20);

  logger.debug("disable app timeout");
  me.appTimeoutEnabled = false;

  logger.debug("Start up complete");
};
init();


