import analytics from "fitbit-google-analytics/app"
import { logger } from "../../../common/logger";

const trackingId = "UA-150395154-1";
let isDisabled = false;

const disableAnalytics = () => {
  // Intentionally set to a dummy UA-id
  analytics.configure({
    tracking_id: "UA-123456789-1"
  });
};

const enableAnalytics = () => {
  analytics.configure({
    tracking_id: trackingId
  })
}

export const toggleDisableAnalytics = disableAnalyticsSetting => {
  logger.trace("lib.google.analytics.toggleDisableAnalytics");
  logger.debug(`disableAnalyticsSetting: ${disableAnalyticsSetting}`);
  isDisabled = disableAnalyticsSetting;
  init();
};

export const init = () => {
  logger.trace("lib.google.analytics.init");
  if (isDisabled) {
    disableAnalytics();
  } else {
    enableAnalytics();
  }
};

