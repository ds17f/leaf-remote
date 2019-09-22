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
