import { peerSocket } from "messaging";
import { logger } from "../lib/logger";
import { CONNECT_BEGIN } from "../../common/actions/connect.js";

export const connectBeginMessage = () => CONNECT_BEGIN;

export const init = () => {
  peerSocket.addEventListener('open', () => {
    logger.debug("Ready to send/receive");
    send(connectBeginMessage());
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

export const registerAPIActionListener = (apiAction, callback) => {
  peerSocket.addEventListener('message', async (evt) => {
    const { data } = evt;
    const { type, action } = data;

    if ( type === "API" && action === apiAction) {
      await callback();
    }
  });
};
