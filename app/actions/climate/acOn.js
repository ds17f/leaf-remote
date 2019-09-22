import document from 'document';

import * as messages from "../../../common/messages/startAc";
import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { getVisibleTile } from "../../ui/tiles";

// TODO: Object.assign doesn't exist on the device, but it does on the companion... wtf?
// const AC_ON = () => Object.assign({}, messages.AC_ON_START);
const AC_ON = () => messages.AC_ON_START;

export const init = () => {
  logger.trace("action.acOn.init");

  document.addEventListener('keypress', (e) => {
    if (e.key === "up") {
      e.preventDefault();

      if (getVisibleTile() === "acOn") {
        logger.info("Sending Climate Start Request");
        logger.trace(`AC_ON: ${AC_ON()}`);
        messaging.send(AC_ON());
      }

    }
  });
};

