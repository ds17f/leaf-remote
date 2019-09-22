import document from "document";
import { peerSocket, CloseCode } from "messaging";
import { me } from "appbit";

import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { consoleWarn, consoleError } from "../console";

const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
};

const setCompanionIcon = mask => {
  const iconMask = document.getElementById('icon-mask').getElementsByTagName('rect')[0];
  iconMask.x = mask;
};

const showNotConnected = () => {
  setCompanionIcon(icons.notConnected);
};
const showConnecting = () => {
  setCompanionIcon(icons.connecting);
};
const showConnected = () => {
  setCompanionIcon(icons.connected);
};
const showFailed = () => {
  setCompanionIcon(icons.failed);
};

const ensureConnect = (timeOut = 20) => {
  logger.trace(`peerConnection.ensureConnect: ${timeOut} seconds`);
  setTimeout(() => {
    if (! messaging.isPeerConnected() ){
      consoleError("Peer Connection", `Connection failed after ${timeOut} seconds`);

      logger.debug("enable app timeout");
      me.appTimeoutEnabled = true;
    } else {
      logger.debug(`peer is connected after: ${timeOut} seconds`);
    }
  }, timeOut * 1000)
};

export const init = () => {
  logger.trace("ui.peerConnect.init");

  // if already open, show it
  if (peerSocket.readyState === peerSocket.OPEN ){
    showConnected();
  } else {
    showNotConnected();
  }
  // add a listener for when it opens
  peerSocket.addEventListener('open', (evt) => {
    showConnected();
    consoleWarn("Peer Connection", "Peer is connected");
  });

  // add a listener for when it closes
  peerSocket.addEventListener('close', (evt) => {
    logger.trace(`peer closed: ${evt.code}`);
    if (evt.code !== CloseCode.PEER_INITIATED) {
      showFailed();
    }
  });

  // ensure that we connect after some time
  ensureConnect()

};
