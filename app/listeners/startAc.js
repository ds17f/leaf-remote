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

import * as messages from "../../common/messages/startAc";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";
import { trackAPIResponse } from "../_lib/google/analytics";

import { consoleError, consoleInfo, consoleWarn} from "../ui/console";

let stayAlive = false;
export const toggleStayAlive = on => {
  stayAlive = on
};

export const registerListener = () => {
  logger.trace("ui.console.registerStartActions");

  registerActionListener(messages.AC_ON_START, () => {
    consoleInfo("Climate Start", "Start sent, awaiting result.");
    trackAPIResponse("ClimateStart", "Begin", "Begin")
  });

  registerActionListener(messages.AC_ON_POLLING, (data) => {
    consoleInfo("Climate Start", `Awaiting result, loop: ${data.loop}`);
    trackAPIResponse("ClimateStart", "Poll", data.loop)
  });

  registerActionListener(messages.AC_ON_SUCCESS, () => {
    consoleWarn("Climate Start", "Climate Started Successfully");
    trackAPIResponse("ClimateStart", "Success", "Success")
    me.appTimeoutEnabled = !stayAlive;
    logger.debug(`appTimeoutEnabled = ${me.appTimeoutEnabled}`)
  });

  registerActionListener(messages.AC_ON_TIMEOUT, (data) => {
    consoleError("Climate Start", `Climate Start Failed after: ${data.timeout} seconds.`);
    trackAPIResponse("ClimateStart", "Timeout", data.timeout)
  });

  registerActionListener(messages.AC_ON_FAILURE, (data) => {
    consoleError("Climate Start", `Climate Start Failed with: ${data.result}.`);
    trackAPIResponse("ClimateStart", "Failed", data.result)
  });
};
