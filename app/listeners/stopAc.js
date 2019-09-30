/**
 * Copyright 2019 Damian Silbergleith Cunniff
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    logger.debug(`appTimeoutEnabled = ${me.appTimeoutEnabled}`)
  });

  registerActionListener(messages.AC_OFF_TIMEOUT, (data) => {
    consoleError("Climate Stop", `Climate Stop Failed after: ${data.timeout} seconds.`);
  });

  registerActionListener(messages.AC_OFF_FAILURE, (data) => {
    consoleError("Climate Stop", `Climate Stop Failed with: ${data.result}.`);
  });
};
