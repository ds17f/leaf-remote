import { registerActionListener } from "../../_lib/fitbit/messaging";
import { startAC } from '../../actions/climate/startAc';
import * as messages from "../../../common/messages/startAc";

export const registerListener = getSettings => {
  const startAcAction = startAC(getSettings);
  registerActionListener(messages.AC_ON_START, startAcAction);
};
