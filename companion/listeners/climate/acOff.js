import { registerActionListener } from "../../_lib/fitbit/messaging";
import { stopAC } from '../../actions/climate/stopAc';
import * as messages from "../../../common/messages/stopAc";

export const registerListener = getSettings => {
  const stopAcAction = stopAC(getSettings);
  registerActionListener(messages.AC_OFF_START, stopAcAction);
};