import { createClimateAction, AC_ON } from "./_lib/acAction";
import * as messages from "../../../common/messages/startAc";

const AC_ON_START = () => Object.assign({}, messages.AC_ON_START);
const AC_ON_POLLING = loop => Object.assign({loop: loop}, messages.AC_ON_POLLING);
const AC_ON_SUCCESS = () => Object.assign({}, messages.AC_ON_SUCCESS);
const AC_ON_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, messages.AC_ON_TIMEOUT);
const AC_ON_FAILURE = error => Object.assign({result: error}, messages.AC_ON_FAILURE);

export const startAC = getSettings => {
  return createClimateAction(getSettings, AC_ON, AC_ON_START, AC_ON_POLLING, AC_ON_SUCCESS, AC_ON_TIMEOUT, AC_ON_FAILURE);
};

