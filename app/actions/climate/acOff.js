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
import * as messages from "../../../common/messages/stopAc";
import { logger } from "../../../common/logger";

import * as messaging from "../../_lib/fitbit/messaging";

import { getVisibleTile } from "../../ui/tiles";
import { registerButtonListeners } from "../../ui/buttons";

// TODO: Object.assign doesn't exist on the device, but it does on the companion... wtf?
// const AC_OFF = () => Object.assign({}, messages.AC_OFF_START);
const AC_OFF = () => messages.AC_OFF_START;

export const doButtonPressHandler = () => {
  if (getVisibleTile() === "acOff") {
    logger.info("Sending Climate Stop Request");
    messaging.send(AC_OFF());
    return true;
  }
  return false;
};

export const init = () => {
  logger.trace("action.acOff.init");
  registerButtonListeners(doButtonPressHandler);
};

