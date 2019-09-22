export const levels = {
  TRACE: -1,
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
let level = levels.TRACE;
export const setLogLevel = newLevel => {
  level = newLevel
};

export const logger = {
  trace: (m) => (level <= levels.TRACE) && console.log(m),
  vibrate: (m) => (level <= levels.DEBUG && console.warn(`~~~ ${m} ~~~`)),
  debug: (m) => (level <= levels.DEBUG) && console.log(m),
  info: (m) => (level <= levels.INFO) && console.info(m),
  warn: (m) => (level <= levels.WARN) && console.warn(m),
  error: (m) => (level <= levels.ERROR) && console.error(m),
};
