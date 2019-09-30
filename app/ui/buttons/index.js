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
import document from "document";
import { logger } from "../../../common/logger";

const buttons = {
  doButton: "down",
  nextButton: "up"
};

export const swapButtons = swap => {
  logger.trace("ui.buttons.swapButtons");
  buttons.doButton = swap ? "down" : "up";
  buttons.nextButton = swap ? "up" : "down";
};

export const registerButtonListeners = (doAction, nextAction = null) => {
  logger.trace("ui.buttons.registerButtonListeners");
  document.addEventListener('keypress', (e) => {
    if ( doAction ) {
      if (e.key === buttons.doButton) {
        e.preventDefault();
        doAction();
      }
    }
    if ( nextAction ) {
      if (e.key === buttons.nextButton) {
        e.preventDefault();
        nextAction();
      }
    }
 });
};