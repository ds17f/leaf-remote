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
import { peerSocket } from "messaging";

import { logger } from "../../../common/logger";

export const isPeerConnected = () => {
  return peerSocket.readyState === peerSocket.OPEN;
};

export const init = () => {
  logger.trace("messaging.init");
  peerSocket.addEventListener('open', () => {
    logger.debug("Ready to send/receive");
  });

  peerSocket.addEventListener('message', (evt) => {
    logger.debug(`Received message: ${JSON.stringify(evt.data)}`);
  });
};

export const send = (data) => {
  try {
    logger.debug(`Sending message: ${JSON.stringify(data)}`);
    peerSocket.send(data);
  } catch (error) {
    logger.error(`couldn't send "${JSON.stringify(data)}": ${error}`)
  }
};

export const registerActionListener = (msg, callback) => {
  peerSocket.addEventListener('message', async (evt) => {
    const { data } = evt;

    if ( data.type === msg.type && data.action === msg.action ) {
      await callback(data);
    }
  });
};
