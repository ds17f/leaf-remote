import { logger, levels, setLogLevel } from "../common/logger";

import * as messaging from "./_lib/fitbit/messaging";
import * as settings from "./_lib/fitbit/settings"

import * as listeners from './listeners';
const init = () => {
  setLogLevel(levels.TRACE);
  logger.warn("---- Start Companion ----");

  // plumbing
  messaging.init();
  settings.init();

  // listeners
  listeners.init(settings.getCompanion);


};

init();

