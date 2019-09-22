import { vibration } from "haptics";
import { display } from "display";

import { logger } from "../../../common/logger";

export const vibrateSuccess = (vibrateForSeconds = 3) => {
  vibration.stop();
  logger.vibrate("vibrate: alert");
  vibration.start("alert");
  display.poke();
  setTimeout(() => {
    logger.vibrate("vibrate: alert stop");
    vibration.stop();
  }, vibrateForSeconds * 1000);
};

export const vibrateFailure = () => {
  vibrateSuccess(10);
};

export const vibrateInfo = isQuiet => {
  vibration.stop();
  if ( ! isQuiet ) {
    logger.vibrate("vibrateInfo: ping");
    vibration.start("ping");
    display.poke();
  }
};

export const vibrateUi = () => {
  vibration.stop();
  logger.vibrate("vibrateUi: ping");
  vibration.start("ping");
  display.poke();
};

