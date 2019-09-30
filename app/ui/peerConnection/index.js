/**
 * Copyright 2019 Damian Silbergleith Cunniff
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import document from "document";
import { peerSocket, CloseCode } from "messaging";
import { me } from "appbit";

import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { consoleError } from "../console";

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
      showNotConnected();

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
    logger.trace('peerConnection.peerSocket.onopen');
    showConnected();
  });

  // add a listener for when it closes
  peerSocket.addEventListener('close', (evt) => {
    logger.trace('peerConnection.peerSocket.onclose');
    showFailed();
  });

  // add a listener for when it closes
  peerSocket.addEventListener('error', (evt) => {
    logger.trace('peerConnection.peerSocket.onerror');
    showFailed();
  });


  // ensure that we connect after some time
  ensureConnect()

};
