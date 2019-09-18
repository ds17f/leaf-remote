import { logger } from "./logger";

import * as startAc from "./carwings/startAc"
import * as stopAc from "./carwings/stopAc"

import * as messaging from "./messaging";
import * as settings from "./settings"

const init = () => {
  logger.debug("---- Start Companion ----");

  // plumbing
  messaging.init();
  settings.init();

  // api
  startAc.init(settings.getCompanion);
  stopAc.init(settings.getCompanion);

};

init();


