import * as messages from "../../common/messages/startAc";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../ui/console";

export const registerListener = () => {
  logger.trace("ui.console.registerStartActions");

  registerActionListener(messages.AC_ON_START, () => {
    consoleInfo("Climate Start", "Start sent, awaiting result.")
  });

  registerActionListener(messages.AC_ON_POLLING, (data) => {
    consoleInfo("Climate Start", `Awaiting result, loop: ${data.loop}`)
  });

  registerActionListener(messages.AC_ON_SUCCESS, () => {
    consoleWarn("Climate Start", "Climate Started Successfully")
  });

  registerActionListener(messages.AC_ON_TIMEOUT, (data) => {
    consoleError("Climate Start", `Climate Start Failed after: ${data.timeout} seconds.`)
  });

  registerActionListener(messages.AC_ON_FAILURE, (data) => {
    consoleError("Climate Start", `Climate Start Failed with: ${data.result}.`)
  });
};
