import {peerSocket} from "messaging";
import document from 'document';

import * as messaging from "../fitbit/messaging";
import * as actions from "../../common/actions/startAc";
import { logger } from "../../common/logger";

import { getVisibleTile } from "../ui/tiles";

export const init = () => {
  logger.debug("action.acOn.init");
  document.addEventListener('keypress', (e) => {
    if (e.key === "up") {
      e.preventDefault();
      if (getVisibleTile() === "acOn") {
        logger.info("Sending Climate Start Request");
        messaging.send(actions.AC_ON_START);
      }
    }
  });
};

