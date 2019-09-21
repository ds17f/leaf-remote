import { peerSocket } from "messaging";
import { logger } from "../../common/logger";

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

export const registerActionListener = (msg, callback) => {
  peerSocket.addEventListener('message', async (evt) => {
    const { data } = evt;

    if ( data.type === msg.type && data.action === msg.action ) {
      await callback(data);
    }
  });
};
