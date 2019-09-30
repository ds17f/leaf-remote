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
import { vibration } from "haptics";
import { display } from "display";

import { logger } from "../../../common/logger";

export const vibrateSuccess = (vibrateForSeconds = 3) => {
  vibration.stop();
  logger.vibrate("vibrate: alert");
  vibration.start("alert");
  display.poke();
  setTimeout(() => {
    logger.vibrate("vibrate: alert stop");
    vibration.stop();
  }, vibrateForSeconds * 1000);
};

export const vibrateFailure = () => {
  vibrateSuccess(10);
};

export const vibrateInfo = isQuiet => {
  vibration.stop();
  if ( ! isQuiet ) {
    logger.vibrate("vibrateInfo: ping");
    vibration.start("ping");
    display.poke();
  }
};

export const vibrateUi = () => {
  vibration.stop();
  logger.vibrate("vibrateUi: ping");
  vibration.start("ping");
  display.poke();
};

