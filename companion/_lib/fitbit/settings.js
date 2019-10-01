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
import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { logger, levels } from "../../../common/logger";
import { send } from "../fitbit/messaging";

const DEFAULT_API_TIMEOUT = 180;
const DEFAULT_API_POLL_INTERVAL = 10;
const DEFAULT_REGION_CODE = "NNA";

let companion = {};
let app = {};

export const getCompanion = () => {
  return Object.assign({}, companion);
};

const SETTINGS = settings => ({type: "SETTINGS", settings: settings });

const getBoolSetting = settingName => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}`);

  const result = JSON.parse(setting) || false;
  settingsStorage.setItem(settingName, result);
  return result;
};

const getTextSetting = (settingName, defaultVal = "") => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}, default: ${defaultVal}`);
  const parsedSetting = JSON.parse(setting);
  if ( ! parsedSetting || ! parsedSetting.name ) {
    settingsStorage.setItem(settingName, JSON.stringify({name: defaultVal}));
    return defaultVal;
  }
  return parsedSetting.name
};

const build = () => {
  companion = {
    username: getTextSetting("username"),
    password: getTextSetting("password"),
    apiTimeout: getTextSetting("apiTimeout", DEFAULT_API_TIMEOUT),
    apiPollInterval: getTextSetting("apiPollInterval", DEFAULT_API_POLL_INTERVAL),
    region: getTextSetting("region", DEFAULT_REGION_CODE),

    demo: getBoolSetting("demo"),
    debug: getBoolSetting("debug"),
    swapButtons: getBoolSetting("swapButtons"),
    stayAlive: getBoolSetting("stayAlive"),
    logLevel: getBoolSetting("debug") ? levels.TRACE : levels.WARN
  };
  app = {
    debug: companion.debug,
    demo: companion.demo,
    swapButtons: companion.swapButtons,
    stayAlive: companion.stayAlive,
    logLevel: companion.logLevel
  };
};

export const init = () => {
  // build so a caller can access companion and app exports
  build();

  // when the settings change, update the settings and send them to the app
  settingsStorage.addEventListener("change", () => {
    build();
    send(SETTINGS(app))
  });

  // when the socket opens, send the current app settings
  peerSocket.addEventListener("open", () => {
    send(SETTINGS(app))
  });
};

