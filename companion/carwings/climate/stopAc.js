import { createClimateAction, AC_OFF } from "./acAction";
import { registerActionListener } from "../../fitbit/messaging";
import * as actions from "../../../common/actions/stopAc";

const AC_OFF_START = () => Object.assign({}, actions.AC_OFF_START);
const AC_OFF_POLLING = loop => Object.assign({loop: loop}, actions.AC_OFF_POLLING);
const AC_OFF_SUCCESS = () => Object.assign({}, actions.AC_OFF_SUCCESS);
const AC_OFF_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, actions.AC_OFF_TIMEOUT);
const AC_OFF_FAILURE = error => Object.assign({result: error}, actions.AC_OFF_FAILURE);

export const init = getSettings => {
  const startAC = createClimateAction(getSettings, AC_OFF, AC_OFF_START, AC_OFF_POLLING, AC_OFF_SUCCESS, AC_OFF_TIMEOUT, AC_OFF_FAILURE);
  registerActionListener(actions.AC_OFF_START, startAC);
};