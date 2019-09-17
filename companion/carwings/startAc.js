import { createClimateAction, AC_ON } from "./acAction";

const AC_ON_START = () => ({type: "API", action: "AC_ON_START"});
const AC_ON_POLLING = loop => ({type: "API", action: "AC_ON_POLLING", loop: loop});
const AC_ON_SUCCESS = () => ({type: "API", action: "AC_ON_SUCCESS"});
const AC_ON_TIMEOUT = (timeout) => ({type: "API", action: "AC_ON_TIMEOUT", timeout: timeout});
const AC_ON_FAILURE = error => ({type: "API", action: "AC_ON_FAILURE", result: error.toString()});

export const startAC = createClimateAction(AC_ON, AC_ON_START, AC_ON_POLLING, AC_ON_SUCCESS, AC_ON_TIMEOUT, AC_ON_FAILURE);

