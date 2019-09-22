import * as messages from "../../common/messages/stopAc";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../ui/console";

export const registerListener = () => {
  logger.trace("ui.console.registerStopActions");

  registerActionListener(messages.AC_OFF_START, () => {
    consoleInfo("Stop Climate", "Stop sent, awaiting result.")
  });

  registerActionListener(messages.AC_OFF_POLLING, (data) => {
    consoleInfo("Stop Climate", `Awaiting result, loop: ${data.loop}`)
  });

  registerActionListener(messages.AC_OFF_SUCCESS, () => {
    consoleWarn("Stop Climate", "Climate Stopped Successfully")
  });

  registerActionListener(messages.AC_OFF_TIMEOUT, (data) => {
    consoleError("Stop Climate", `Climate Stop Failed after: ${data.timeout} seconds.`)
  });

  registerActionListener(messages.AC_OFF_FAILURE, (data) => {
    consoleError("Stop Climate", `Climate Stop Failed with: ${data.result}.`)
  });
};
