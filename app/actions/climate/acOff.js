import document from 'document';

import * as messages from "../../../common/messages/stopAc";
import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { getVisibleTile } from "../../ui/tiles";

// TODO: Object.assign doesn't exist on the device, but it does on the companion... wtf?
// const AC_OFF = () => Object.assign({}, messages.AC_OFF_START);
const AC_OFF = () => messages.AC_OFF_START;

export const init = () => {
  logger.trace("action.acOff.init");

  document.addEventListener('keypress', (e) => {
    if (e.key === "up") {
      e.preventDefault();

      if (getVisibleTile() === "acOff") {
        logger.info("Sending Climate Stop Request");
        messaging.send(AC_OFF());
      }

    }
  });
};

