import { createClimateAction, AC_ON } from "./acAction";
import { registerActionListener } from "../../fitbit/messaging";
import * as actions from "../../../common/actions/startAc";

const AC_ON_START = () => Object.assign({}, actions.AC_ON_START);
const AC_ON_POLLING = loop => Object.assign({loop: loop}, actions.AC_ON_POLLING);
const AC_ON_SUCCESS = () => Object.assign({}, actions.AC_ON_SUCCESS);
const AC_ON_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, actions.AC_ON_TIMEOUT);
const AC_ON_FAILURE = error => Object.assign({result: error}, actions.AC_ON_FAILURE);

export const init = getSettings => {
  const startAC = createClimateAction(getSettings, AC_ON, AC_ON_START, AC_ON_POLLING, AC_ON_SUCCESS, AC_ON_TIMEOUT, AC_ON_FAILURE);
  registerActionListener(actions.AC_ON_START, startAC);
};
