import document from "document";
import { logger } from "../../../common/logger";

const buttons = {
  doButton: "down",
  nextButton: "up"
};

export const swapButtons = swap => {
  logger.trace("ui.buttons.swapButtons");
  buttons.doButton = swap ? "down" : "up";
  buttons.nextButton = swap ? "up" : "down";
};

export const registerButtonListeners = (doAction, nextAction = null) => {
  logger.trace("ui.buttons.registerButtonListeners");
  document.addEventListener('keypress', (e) => {
    if ( doAction ) {
      if (e.key === buttons.doButton) {
        e.preventDefault();
        doAction();
      }
    }
    if ( nextAction ) {
      if (e.key === buttons.nextButton) {
        e.preventDefault();
        nextAction();
      }
    }
 });
};