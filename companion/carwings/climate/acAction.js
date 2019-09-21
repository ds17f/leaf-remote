import * as messaging from "../../fitbit/messaging";

import { sleepSeconds } from '../../lib/utils';
import { logger } from "../../../common/logger";

import { nissanLogin } from '../login';

export const AC_ON = "AC_ON";
export const AC_OFF = "AC_OFF";
export const createClimateAction = (getSettings, ON_OR_OFF, BEGIN, POLL, SUCCESS, TIMEOUT, FAILURE) => {
  return async () => {
    const settings = getSettings();

    // TODO: Demo mode???
    if (settings.demo) {
      logger.debug(`demo: ${settings.demo}`);
      return;
    }

    // Login to nissan
    const session = await nissanLogin(settings.username, settings.password);
    if (! session.loggedIn) {
      messaging.send(FAILURE("Login failed"));
      return false;
    }

    // Setup Climate Specific Settings
    let climateActionDescription;
    let startClimateAction;
    let getClimateActionRequest;
    if (ON_OR_OFF === AC_ON) {
      climateActionDescription = "Start";
      startClimateAction = session.leafRemote.startClimateControl;
      getClimateActionRequest = session.leafRemote.getStartClimateControlRequest;
    } else {
      climateActionDescription = "Stop";
      startClimateAction = session.leafRemote.stopClimateControl;
      getClimateActionRequest = session.leafRemote.getStopClimateControlRequest;
    }

    // Init polling controls (counter and timeout)
    let loop = 0;
    let isTimeout = false;
    // after apiTimeout seconds flip the isTimeout flag
    let timeout = setTimeout(
      () => isTimeout = true,
      settings.apiTimeout * 1000
    );


    // Tell the car to start the climate action
    const resultKey = await startClimateAction();
    messaging.send(BEGIN());

    // Poll to see if the action has completed
    let climateResult = getClimateActionRequest(resultKey);
    try {
      while (!await climateResult && !isTimeout) {
        // announce new loop and sleep
        loop += 1;
        messaging.send(POLL(loop));
        logger.warn(`Climate ${climateActionDescription.toLowerCase()} result not ready yet.  Sleeping: ${settings.apiPollInterval} seconds`);
        await sleepSeconds(settings.apiPollInterval);

        // get a promise for the new result
        climateResult = getClimateActionRequest(resultKey);
      }

      // we have a climateResult or a timeout
      if (isTimeout) {
        messaging.send(TIMEOUT(settings.apiTimeout));
        logger.warn(`Climate ${climateActionDescription} Timed Out!!!`);
      } else {
        // TODO: Need to check results here to make sure that we actually succeeded
        logger.debug(`climateResult: ${JSON.stringify(climateResult)}`);
        messaging.send(SUCCESS());
        logger.warn(`Climate ${climateActionDescription} Succeeded!!!`);
      }
    } catch (error) {
      messaging.send(FAILURE(error));
      logger.error(`Climate ${climateActionDescription} Failed on Error: ${error}!!!`);
    } finally {
      // cleanup the timeout timer
      clearTimeout(timeout);
    }
  };
};

