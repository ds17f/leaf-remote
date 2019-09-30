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
import {logger} from "../../../common/logger";
import * as vibration from '../vibration';

export const consoleInfo = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.info(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
};

export const consoleWarn = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.warn(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
  vibration.vibrateSuccess()
};

export const consoleError = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.error(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
  vibration.vibrateFailure();
};
