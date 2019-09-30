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
import { me } from "appbit";
import { readFileSync, writeFileSync } from "fs";

import { logger, levels } from "../../../common/logger";

// setup with sane defaults
let appSettings = {
  debug: false,
  demo: false,
  logLevel: levels.TRACE
};

const writeSettings = (settings, settingsFile = "./settings.json") => {
  logger.debug("writing settings");
  writeFileSync(settingsFile, settings, "json");
};

const readSettings = (settingsFile = "./settings.json") => {
  logger.debug("reading settings");
  try {
    return readFileSync(settingsFile, "json");
  } catch (error) {
    logger.error(`Could not open settingsFile: ${settingsFile} - ${error}`);
    // return the current (default) settings
    return appSettings;
  }
};

export const init = (settingsCallback) => {
  logger.trace("settings.init");
  // on init read the settings from a file
  appSettings = readSettings();
  settingsCallback(appSettings);

  me.addEventListener("unload", () => {
    writeSettings(appSettings);
  });


  // TODO: Update this to use messaging.registerActionListener?
  // add a listener for SETTINGS messages and update accordingly
  peerSocket.addEventListener('message', async (evt) => {
    const { data } = evt;
    if ( data.type === "SETTINGS" ) {
      writeSettings(data.settings);
      appSettings = data.settings;
      settingsCallback(appSettings);
    }
  });

};
