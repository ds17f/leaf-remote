import { createClimateAction, AC_OFF } from "./acAction";
import { registerAPIActionListener } from "../messaging";

const AC_OFF_START = () => ({type: "API", action: "AC_OFF_START"});
const AC_OFF_POLLING = loop => ({type: "API", action: "AC_OFF_POLLING", loop: loop});
const AC_OFF_SUCCESS = () => ({type: "API", action: "AC_OFF_SUCCESS"});
const AC_OFF_TIMEOUT = (timeout) => ({type: "API", action: "AC_OFF_TIMEOUT", timeout: timeout});
const AC_OFF_FAILURE = error => ({type: "API", action: "AC_OFF_FAILURE", result: error.toString()});


export const init = getSettings => {
  const stopAC = createClimateAction(getSettings, AC_OFF, AC_OFF_START, AC_OFF_POLLING, AC_OFF_SUCCESS, AC_OFF_TIMEOUT, AC_OFF_FAILURE);
  registerAPIActionListener("AC_OFF", stopAC);
};