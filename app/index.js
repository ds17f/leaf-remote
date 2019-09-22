import document from "document";
import { peerSocket } from "messaging";
import { me } from "appbit";

import * as settings from './_lib/fitbit/settings';
import * as messaging from './_lib/fitbit/messaging'

import * as tiles from './ui/tiles';
import * as peerConnection from './ui/peerConnection';
import * as demo from './ui/demo';

import * as actions from './actions';
import * as listeners from './listeners';

import { logger, levels, setLogLevel } from "../common/logger";

const ensureConnect = (timeOut = 10) => {
  setTimeout(() => {
    if (! messaging.isPeerConnected() ){
      logger.error(`Connection failed after ${timeOut} seconds`);

      logger.debug("enable app timeout");
      me.appTimeoutEnabled = true;
    }
  }, timeOut * 1000)
};

const settingsUpdateHandler = settings => {
  setLogLevel(settings.logLevel);
  demo.toggleDemoFlag(settings.demo);
};

const init = () => {
  setLogLevel(levels.TRACE);
  logger.warn("---- Starting up ----");

  settings.init(settingsUpdateHandler);
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


