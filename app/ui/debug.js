import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { logger } from "../../common/logger";

const log = [];

const uiDebug = document.getElementById("console-debug");

const clearLog = () => {
  log.length = 0;
  uiDebug.text = "";
};

const deleteLog = (logFile = "./log.txt") => {
  unlinkSync(logFile);
};

const writeLog = (logFile = "./log.txt") => {
  writeFileSync(logFile, log, "json");
};

const readLog = (logFile = "./log.txt") => {
  if (! state.isDebug) {
    return;
  }
  try {
    const fileLog = readFileSync(logFile, "json");
    const currentLog = log.splice(0);
    clearLog();
    fileLog.forEach(l => logger.debug(l.message, l.timestamp))
    currentLog.forEach(l => logger.debug(l.message, l.timestamp))
  } catch (error) {
    logger.error(`Could not open logfile: ${logFile} - ${error}`)
  }
};