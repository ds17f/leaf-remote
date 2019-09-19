import { vibration } from "haptics";
import { display } from "display";

export const vibrateSuccess = (vibrateForSeconds = 3) => {
  vibration.stop();
  vibration.start("alert");
  display.poke();
  setTimeout(() => {
    vibration.stop();
  }, vibrateForSeconds * 1000);
};

export const vibrateFailure = () => {
  vibrateSuccess(10);
};

export const vibrateInfo = isQuiet => {
  vibration.stop();
  if ( ! isQuiet ) {
    vibration.start("ping");
    display.poke();
  }
};

export const vibrateUi = () => {
  vibration.stop();
  vibration.start("ping");
  display.poke();
};

