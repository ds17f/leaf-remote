import { settingsStorage } from "settings";

import { logger } from "./logger";
import { send as sendMessage } from "./messaging";

export const SETTINGS = settings => ({type: "SETTINGS", settings: settings });

const getBoolSetting = settingName => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}`);
  return JSON.parse(setting) || false;
};

const getTextSetting = settingName => {
  const setting = settingsStorage.getItem(settingName);
  logger.debug(`${settingName}: ${setting}`);
  const parsedSetting = JSON.parse(setting);
  return parsedSetting.name
    ? parsedSetting.name
    : parsedSetting
};

const build = () => {
  const settings = {
    username: getTextSetting("username"),
    password: getTextSetting("password"),
    debug: getBoolSetting("debug"),
    quiet: getBoolSetting("quiet"),
    demo: getBoolSetting("demo")
  };
  logger.debug(`Settings: ${JSON.stringify(settings)}`);
  return settings;
};

export const send = () => {
  // mask for removing settings we don't want to send
  // list all the ones you don't want,
  // the rest will be sent
  const { username, password, ...rest} = build();
  const settingsMessage = SETTINGS(rest);
  sendMessage(settingsMessage);
};

export const setup = () => {
  settingsStorage.onchange = () => {
    send();
  };
};

