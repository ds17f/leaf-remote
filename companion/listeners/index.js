import * as acOn from "./climate/acOn";
import * as acOff from "./climate/acOff";

import { logger } from '../../common/logger';

export const init = getSettings => {
  logger.trace("listeners.init");
  acOn.registerListener(getSettings);
  acOff.registerListener(getSettings);
};
