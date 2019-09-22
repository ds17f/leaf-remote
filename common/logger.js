export const levels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
let level = levels.DEBUG;
export const setLogLevel = newLevel => {
  level = newLevel
};

export const logger = {
  debug: (m) => (level <= levels.DEBUG) && console.log(m),
  info: (m) => (level <= levels.INFO) && console.info(m),
  warn: (m) => (level <= levels.WARN) && console.warn(m),
  error: (m) => (level <= levels.ERROR) && console.error(m),
};
