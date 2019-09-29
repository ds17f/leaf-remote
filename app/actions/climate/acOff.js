import document from 'document';

import * as messages from "../../../common/messages/stopAc";
import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { getVisibleTile } from "../../ui/tiles";
import { registerButtonListeners } from "../../ui/buttons";

// TODO: Object.assign doesn't exist on the device, but it does on the companion... wtf?
// const AC_OFF = () => Object.assign({}, messages.AC_OFF_START);
const AC_OFF = () => messages.AC_OFF_START;

const doButtonPressHandler = () => {
  if (getVisibleTile() === "acOff") {
    logger.info("Sending Climate Stop Request");
    messaging.send(AC_OFF());
  }
};

export const init = () => {
  logger.trace("action.acOff.init");
  registerButtonListeners(doButtonPressHandler);
};

