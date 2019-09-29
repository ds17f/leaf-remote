import document from "document";
import { peerSocket } from "messaging";
import { me } from "appbit";

import * as settings from './_lib/fitbit/settings';
import * as messaging from './_lib/fitbit/messaging'

import * as tiles from './ui/tiles';
import * as peerConnection from './ui/peerConnection';
import * as demo from './ui/demo';
import * as buttons from './ui/buttons';

import * as actions from './actions';
import * as listeners from './listeners';

import { logger, levels, setLogLevel } from "../common/logger";

const settingsUpdateHandler = settings => {
  setLogLevel(settings.logLevel);
  demo.toggleDemoFlag(settings.demo);
  buttons.swapButtons(settings.swapButtons);
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

  logger.debug("disable app timeout");
  me.appTimeoutEnabled = false;

  logger.debug("Start up complete");
};
init();


