import * as loginActions from "../../../../common/actions/login";
import { logger } from "../../../../common/logger";
import { registerActionListener } from "../../../fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../lib";

export const registerLoginActions = () => {
  logger.debug("ui.console.registerLoginActions");
  registerActionListener(loginActions.LOGIN_START, () => {
    consoleInfo("Login", "Logging in to Nissan");
  });
  registerActionListener(loginActions.LOGIN_COMPLETE, () => {
    consoleInfo("Login", "Logged in successfully");
  });
  registerActionListener(loginActions.LOGIN_FAILED, (data) => {
    consoleError("Login", `Login failed: ${data.error}`);
  });
};
