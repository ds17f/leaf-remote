import * as messages from "../../common/messages/login";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo } from "../ui/console";

export const registerListener = () => {
  logger.trace("listeners.login.registerListener");

  registerActionListener(messages.LOGIN_START, () => {
    consoleInfo("Login", "Logging in to Nissan");
  });

  registerActionListener(messages.LOGIN_COMPLETE, () => {
    consoleInfo("Login", "Logged in successfully");
  });

  registerActionListener(messages.LOGIN_FAILED, (data) => {
    consoleError("Login", `Login failed: ${data.error}`);
  });

};
