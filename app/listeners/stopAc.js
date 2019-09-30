import { me } from "appbit";

import * as messages from "../../common/messages/stopAc";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";

import { consoleError, consoleInfo, consoleWarn} from "../ui/console";

let stayAlive = false;
export const toggleStayAlive = on => {
  stayAlive = on
};

export const registerListener = () => {
  logger.trace("ui.console.registerStopActions");

  registerActionListener(messages.AC_OFF_START, () => {
    consoleInfo("Climate Stop", "Stop sent, awaiting result.");
  });

  registerActionListener(messages.AC_OFF_POLLING, (data) => {
    consoleInfo("Climate Stop", `Awaiting result, loop: ${data.loop}`);
  });

  registerActionListener(messages.AC_OFF_SUCCESS, () => {
    consoleWarn("Climate Stop", "Climate Stopped Successfully");
    me.appTimeoutEnabled = !stayAlive;
  });

  registerActionListener(messages.AC_OFF_TIMEOUT, (data) => {
    consoleError("Climate Stop", `Climate Stop Failed after: ${data.timeout} seconds.`);
  });

  registerActionListener(messages.AC_OFF_FAILURE, (data) => {
    consoleError("Climate Stop", `Climate Stop Failed with: ${data.result}.`);
  });
};
