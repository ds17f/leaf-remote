import * as stopAcActions from "../../../../common/actions/stopAc";
import { logger } from "../../../../common/logger";
import { registerActionListener } from "../../../fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../lib";

export const registerStopActions = () => {
  logger.debug("ui.console.registerStopActions");
  registerActionListener(stopAcActions.AC_OFF_START, () => {
    consoleInfo("Stop Climate", "Stop sent, awaiting result.")
  });
  registerActionListener(stopAcActions.AC_OFF_POLLING, (data) => {
    consoleInfo("Stop Climate", `Awaiting result, loop: ${data.loop}`)
  });
  registerActionListener(stopAcActions.AC_OFF_SUCCESS, () => {
    consoleWarn("Stop Climate", "Climate Stopped Successfully")
  });
  registerActionListener(stopAcActions.AC_OFF_TIMEOUT, (data) => {
    consoleError("Stop Climate", `Climate Stop Failed after: ${data.timeout} seconds.`)
  });
  registerActionListener(stopAcActions.AC_OFF_FAILURE, (data) => {
    consoleError("Stop Climate", `Climate Stop Failed with: ${data.result}.`)
  });
};
