import document from 'document';

import * as messages from "../../../common/messages/startAc";
import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { getVisibleTile } from "../../ui/tiles";
import { registerButtonListeners } from "../../ui/buttons";

// TODO: Object.assign doesn't exist on the device, but it does on the companion... wtf?
// const AC_ON = () => Object.assign({}, messages.AC_ON_START);
const AC_ON = () => messages.AC_ON_START;

const doButtonPressHandler = () => {
  if (getVisibleTile() === "acOff") {
    logger.info("Sending Climate Start Request");
    messaging.send(AC_ON());
  }
};

export const init = () => {
  logger.trace("action.acOff.init");
  registerButtonListeners(doButtonPressHandler);
};

