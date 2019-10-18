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

export const trackClimateAPICall = isStart => {
  analytics.send({
    hit_type: "event",
    event_category: "NissanApi",
    event_action: "Climate",
    event_label: isStart ? "Start" : "Stop",
  });
};

export const trackAPIResponse = (category, action, label) => {
  analytics.send({
    hit_type: "event",
    event_category: category,
    event_action: action,
    event_label: label
  });
};

export const trackSwipe = direction => {
  analytics.send({
    hit_type: "event",
    event_category: "Display",
    event_action: "Swipe",
    event_label: direction
  });
};

export const trackTap = () => {
  analytics.send({
    hit_type: "event",
    event_category: "Display",
    event_action: "Tap",
    event_label: "Tap"
  });
};

export const trackButton = buttonAction => {
  analytics.send({
    hit_type: "event",
    event_category: "Button",
    event_action: "Press",
    event_label: buttonAction
  });
};
