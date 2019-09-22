import {peerSocket} from "messaging";
import document from 'document';

import * as messaging from "../fitbit/messaging";
import * as actions from "../../common/actions/stopAc";
import { logger } from "../../common/logger";

import { getVisibleTile } from "../ui/tiles";

export const init = () => {
  logger.debug("action.acOff.init");
  document.addEventListener('keypress', (e) => {
    if (e.key === "up") {
      e.preventDefault();
      if (getVisibleTile() === "acOff") {
        logger.info("Sending Climate Stop Request");
        messaging.send(actions.AC_OFF_START);
      }
    }
  });
};

