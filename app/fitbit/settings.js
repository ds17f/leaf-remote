import { peerSocket } from "messaging";
import { readFileSync, writeFileSync } from "fs";
import { logger } from "../../common/logger";

const writeSettings = (settings, settingsFile = "./settings.json") => {
  logger.debug("writing settings");
  writeFileSync(settingsFile, settings, "json");
};

const readSettings = (settingsFile = "./settings.json") => {
  logger.debug("reading settings");
  try {
    return readFileSync(settingsFile, "json");
  } catch (error) {
    logger.error(`Could not open settingsFile: ${settingsFile} - ${error}`)
  }
};

export const init = settingsCallback => {
  logger.debug("settings.init");
  // on init read the settings from a file
  const settings = readSettings();
  // and push them out to the callback so it can update
  // TODO: need to verify what happens when there's no settings file
  settingsCallback(settings);

  // TODO: Update this to use messaging.registerActionListener?
  // add a listener for SETTINGS messages and update accordingly
  peerSocket.addEventListener('message', async (evt) => {
    const { data } = evt;
    if ( data.type === "SETTINGS" ) {
      writeSettings(data.settings);
      settingsCallback(data.settings);
    }
  });
};
