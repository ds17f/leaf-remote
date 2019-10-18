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
import * as messages from "../../common/messages/login";
import { logger } from "../../common/logger";
import { registerActionListener } from "../_lib/fitbit/messaging";
import { trackAPIResponse } from "../_lib/google/analytics";

import { consoleError, consoleInfo } from "../ui/console";

export const registerListener = () => {
  logger.trace("listeners.login.registerListener");

  registerActionListener(messages.LOGIN_START, () => {
    consoleInfo(null, "Logging in to Nissan");
    trackAPIResponse("Login", "Begin", "Begin")
  });

  registerActionListener(messages.LOGIN_COMPLETE, () => {
    consoleInfo(null, "Logged in successfully");
    trackAPIResponse("Login", "Success", "Success")
  });

  registerActionListener(messages.LOGIN_FAILED, (data) => {
    consoleError(null, `Login failed: ${data.error}`);
    trackAPIResponse("Login", "Failed", data.error)
  });

};
