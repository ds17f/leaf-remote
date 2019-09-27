import * as messages from "../../common/messages/login";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo } from "../ui/console";

export const registerListener = () => {
  logger.trace("listeners.login.registerListener");

  registerActionListener(messages.LOGIN_START, () => {
    consoleInfo(null, "Logging in to Nissan");
  });

  registerActionListener(messages.LOGIN_COMPLETE, () => {
    consoleInfo(null, "Logged in successfully");
  });

  registerActionListener(messages.LOGIN_FAILED, (data) => {
    consoleError(null, `Login failed: ${data.error}`);
  });

};
