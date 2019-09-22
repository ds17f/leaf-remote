import * as acOn from './climate/acOn';
import * as acOff from './climate/acOff';

import { logger } from "../../common/logger";

export const init = () => {
  logger.trace("actions.init");
  acOn.init();
  acOff.init();
};
