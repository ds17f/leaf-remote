import { peerSocket } from "messaging";
import { logger } from "../lib/logger";

export const isPeerConnected = () => {
  return peerSocket.readyState === peerSocket.OPEN;
};

export const init = () => {
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
