import * as startAcActions from "../../../../common/actions/startAc";
import { logger } from "../../../../common/logger";
import { registerActionListener } from "../../../fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../lib";

export const registerStartActions = () => {
  logger.debug("ui.console.registerStartActions");
  registerActionListener(startAcActions.AC_ON_START, () => {
    consoleInfo("Start Climate", "Start sent, awaiting result.")
  });
  registerActionListener(startAcActions.AC_ON_POLLING, (data) => {
    consoleInfo("Start Climate", `Awaiting result, loop: ${data.loop}`)
  });
  registerActionListener(startAcActions.AC_ON_SUCCESS, () => {
    consoleWarn("Start Climate", "Climate Started Successfully")
  });
  registerActionListener(startAcActions.AC_ON_TIMEOUT, (data) => {
    consoleError("Start Climate", `Climate Start Failed after: ${data.timeout} seconds.`)
  });
  registerActionListener(startAcActions.AC_ON_FAILURE, (data) => {
    consoleError("Start Climate", `Climate Start Failed with: ${data.result}.`)
  });
};
