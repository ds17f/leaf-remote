import { createClimateAction, AC_OFF } from "./_lib/acAction";
import * as messages from "../../../common/messages/stopAc";

const AC_OFF_START = () => Object.assign({}, messages.AC_OFF_START);
const AC_OFF_POLLING = loop => Object.assign({loop: loop}, messages.AC_OFF_POLLING);
const AC_OFF_SUCCESS = () => Object.assign({}, messages.AC_OFF_SUCCESS);
const AC_OFF_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, messages.AC_OFF_TIMEOUT);
const AC_OFF_FAILURE = error => Object.assign({result: error}, messages.AC_OFF_FAILURE);

export const stopAC = getSettings => {
  return createClimateAction(getSettings, AC_OFF, AC_OFF_START, AC_OFF_POLLING, AC_OFF_SUCCESS, AC_OFF_TIMEOUT, AC_OFF_FAILURE);
};

