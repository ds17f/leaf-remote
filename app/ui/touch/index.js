import { registerTouch } from "../../_lib/fitbit/touch";
import { doButtonPressHandler as acOffPressHandler } from "../../actions/climate/acOff";
import { doButtonPressHandler as acOnPressHandler } from "../../actions/climate/acOn";

import { rotateTile, showConsole} from "../tiles";

let disableTouch = false;
export const toggleDisableTouch = disableTouchSetting => {
  disableTouch = disableTouchSetting;
}


const rotateForward = () => {
  if (! disableTouch) {
    rotateTile(true);
  }
};

const rotateBack = () => {
  if (! disableTouch) {
    rotateTile(false);
  }
};

const tapHandler = () => {
  if (! disableTouch) {
    if ( acOffPressHandler() || acOnPressHandler() ) {
      showConsole();
    }
  }
};

export const init = () => {
  registerTouch('app', tapHandler, rotateBack, rotateForward, rotateBack, rotateForward);
};
