import document from "document";
import {logger} from "../../../common/logger";
import * as vibration from '../vibration';

export const consoleInfo = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.info(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
};

export const consoleWarn = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.warn(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
  vibration.vibrateSuccess()
};

export const consoleError = (header, body) => {
  const consoleHead = document.getElementById("console-head");
  const consoleBody = document.getElementById("console-body");
  logger.error(`${header} - ${body}`);
  consoleHead.text = header === null ? consoleHead.text : header;
  consoleBody.text = body;
  vibration.vibrateFailure();
};
