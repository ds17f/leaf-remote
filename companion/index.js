import { logger, levels, setLogLevel } from "../common/logger";

import * as startAc from "./carwings/climate/startAc"
import * as stopAc from "./carwings/climate/stopAc"

import * as messaging from "./fitbit/messaging";
import * as settings from "./fitbit/settings"

const init = () => {
  setLogLevel(levels.DEBUG);
  logger.warn("---- Start Companion ----");

  // plumbing
  messaging.init();
  settings.init();

  // api
  startAc.init(settings.getCompanion);
  stopAc.init(settings.getCompanion);

};

init();


