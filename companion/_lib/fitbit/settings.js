import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { logger } from "../../../common/logger";
import { send } from "../fitbit/messaging";

let companion = {};
let app = {};

export const getCompanion = () => {
  return Object.assign({}, companion);
};

const SETTINGS = settings => ({type: "SETTINGS", settings: settings });

const getBoolSetting = settingName => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}`);
  return JSON.parse(setting) || false;
};

const getTextSetting = (settingName, defaultVal = "") => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}, default: ${defaultVal}`);
  const parsedSetting = JSON.parse(setting);
  if ( ! parsedSetting ) {
    return defaultVal;
  }
  return parsedSetting.name
    ? parsedSetting.name
    : defaultVal
};

const build = () => {
  companion = {
    username: getTextSetting("username"),
    password: getTextSetting("password"),
    apiTimeout: getTextSetting("apiTimeout", 300),
    apiPollInterval: getTextSetting("apiPollInterval", 10),

    debug: getBoolSetting("debug"),
    quiet: getBoolSetting("quiet"),
    demo: getBoolSetting("demo")
  };
  app = {
    debug: companion.debug,
    quiet: companion.quiet,
    demo: companion.demo
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

