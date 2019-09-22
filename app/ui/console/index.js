import { registerLoginActions } from "./actions/login";
import { registerStartActions} from "./actions/startAc";
import { registerStopActions } from "./actions/stopAc";

import { logger } from "../../../common/logger";

export const init = () => {
  logger.debug("ui.console.init");
  registerLoginActions();
  registerStartActions();
  registerStopActions();
};
