import * as messages from "../../common/messages/startAc";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../ui/console";

export const registerListener = () => {
  logger.trace("ui.console.registerStartActions");

  registerActionListener(messages.AC_ON_START, () => {
    consoleInfo("Start Climate", "Start sent, awaiting result.")
  });

  registerActionListener(messages.AC_ON_POLLING, (data) => {
    consoleInfo("Start Climate", `Awaiting result, loop: ${data.loop}`)
  });

  registerActionListener(messages.AC_ON_SUCCESS, () => {
    consoleWarn("Start Climate", "Climate Started Successfully")
  });

  registerActionListener(messages.AC_ON_TIMEOUT, (data) => {
    consoleError("Start Climate", `Climate Start Failed after: ${data.timeout} seconds.`)
  });

  registerActionListener(messages.AC_ON_FAILURE, (data) => {
    consoleError("Start Climate", `Climate Start Failed with: ${data.result}.`)
  });
};
