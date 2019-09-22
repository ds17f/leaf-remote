import document from "document";
import { peerSocket, CloseCode } from "messaging";

import { logger } from "../../../common/logger";

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
  });

  // add a listener for when it closes
  peerSocket.addEventListener('close', (evt) => {
    logger.trace(`peer closed: ${evt.code}`);
    if (evt.code !== CloseCode.PEER_INITIATED) {
      showFailed();
    }
  });

};
