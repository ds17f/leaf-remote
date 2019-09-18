import { logger } from "./lib/logger";

import * as startAc from "./carwings/climate/startAc"
import * as stopAc from "./carwings/climate/stopAc"

import * as messaging from "./fitbit/messaging";
import * as settings from "./fitbit/settings"

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


