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

export const registerTouch = (uiComponentName, clickCallback, leftCallback, rightCallback, upCallback, downCallback) => {
  logger.debug(`registerTouch: ${uiComponentName}`);
  const uiComponent = document.getElementById(uiComponentName);

  logger.debug(`component: ${uiComponent}`);

  let xPos = 0;
  let yPos = 0;

  const mouseDownHandler = evt => {
    xPos = evt.screenX;
    yPos = evt.screenY;
    logger.debug(`x: ${xPos}, y: ${yPos}`)
  };

  const mouseUpHandler = evt => {
    const xChange = evt.screenX - xPos;
    const yChange = evt.screenY - yPos;
    const threshold = 60;
    logger.debug(`xChange: ${xChange}, yChange: ${yChange}`)

    if ( xChange < -threshold) {
      logger.debug(`${uiComponentName}: leftSwipe`);
      leftCallback && leftCallback(xPos, yPos);
      return;
    }
    if ( xChange > threshold) {
      logger.debug(`${uiComponentName}: rightSwipe`);
      rightCallback && rightCallback(xPos, yPos);
      return;
    }
    if ( yChange < -threshold) {
      logger.debug(`${uiComponentName}: upSwipe`);
      upCallback && upCallback(xPos, yPos);
      return;
    }
    if ( yChange > threshold) {
      logger.debug(`${uiComponentName}: downSwipe`);
      downCallback && downCallback(xPos, yPos);
      return;
    }
    // change hasn't been a swipe, must be a touch
    logger.debug(`${uiComponentName}: tap`);
    clickCallback && clickCallback();
  };

  uiComponent.onmousedown = mouseDownHandler;
  uiComponent.onmouseup = mouseUpHandler;

};
