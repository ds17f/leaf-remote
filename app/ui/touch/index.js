import { registerTouch } from "../../_lib/fitbit/touch";
import { doButtonPressHandler as acOffPressHandler } from "../../actions/climate/acOff";
import { doButtonPressHandler as acOnPressHandler } from "../../actions/climate/acOn";

import { rotateBack, rotateForward, showConsole} from "../tiles";

const tapHandler = () => {
  if ( acOffPressHandler() || acOnPressHandler() ) {
    showConsole();
  }
};

export const init = () => {
  registerTouch('app', tapHandler, rotateBack, rotateForward, rotateBack, rotateForward);
};