import { peerSocket } from "messaging";
import { logger } from "./logger";

export const CONNECT_BEGIN = () => ({type: "CONNECT", action: "BEGIN"});

export const LOGIN_START = () => ({type: "API", action: "LOGIN_START"});
export const LOGIN_COMPLETE = () => ({type: "API", action: "LOGIN_COMPLETE"});
export const LOGIN_FAILED = error => ({type: "API", action: "LOGIN_FAILED", error: error});

export const AC_ON_START = () => ({type: "API", action: "AC_ON_START"});
export const AC_ON_POLLING = loop => ({type: "API", action: "AC_ON_POLLING", loop: loop});
export const AC_ON_SUCCESS = () => ({type: "API", action: "AC_ON_SUCCESS"});
export const AC_ON_TIMEOUT = timeout => ({type: "API", action: "AC_ON_TIMEOUT", timeout: timeout});
export const AC_ON_FAILURE = error => ({type: "API", action: "AC_ON_FAILURE", result: error});

export const AC_OFF_START = () => ({type: "API", action: "AC_OFF_START"});
export const AC_OFF_POLLING = loop => ({type: "API", action: "AC_OFF_POLLING", loop: loop});
export const AC_OFF_SUCCESS = () => ({type: "API", action: "AC_OFF_SUCCESS"});
export const AC_OFF_TIMEOUT = timeout => ({type: "API", action: "AC_OFF_TIMEOUT", timeout: timeout});
export const AC_OFF_FAILURE = error => ({type: "API", action: "AC_OFF_FAILURE", result: error});


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
