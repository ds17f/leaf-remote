import { settingsStorage } from "settings";
import { logger } from "./logger";

import { send, SETTINGS } from "messaging";

export const build = () => {
  const settings = {
    username: settingsStorage.getItem("username"),
    password: settingsStorage.getItem("password"),
    debug: settingsStorage.getItem("debug"),
    quiet: settingsStorage.getItem("quiet"),
    demo: settingsStorage.getItem("demo")
  };
  logger.debug(`Settings: ${JSON.stringify(settings)}`);
  return settings;
};

export const setup = () => {
  settingsStorage.onchange = () => {
    const settingsMessage = SETTINGS(build());
    send(settingsMessage);
  };
};
