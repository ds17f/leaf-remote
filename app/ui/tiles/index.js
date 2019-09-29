import document from "document";
import {peerSocket} from "messaging";

import { CONNECT_BEGIN } from "../../../common/messages/connect.js";

import * as messaging from "../../_lib/fitbit/messaging";
import { logger } from "../../../common/logger";

import * as vibration from "../vibration";
import {consoleError, consoleInfo, consoleWarn} from "../console";
import { registerButtonListeners } from "../buttons";


const index = ["acOn", "acOff", "console"];
let visibleTile = "console";

const setVisibleTile = newTile => {
  logger.debug(`setVisibleTile: ${newTile}`);
  // hide all tiles
  document.getElementsByClassName('tile').forEach(t => {
    t.style.display = "none";
  });

  // show in proper tile
  document.getElementById(newTile).style.display = "inline";

  visibleTile = newTile;
};

export const getVisibleTile = () => {
  // return a copy
  return visibleTile.toString();
};

const nextTile = ( forward = true ) => {

  // if we're showing the debug console
  // we'll just pretend we're showing the normal console
  if (visibleTile === "debug") {
    return index[0];
  }

  let visibleTileIndex = index.indexOf(visibleTile);
  visibleTileIndex += forward ? 1 : -1;

  if (visibleTileIndex >= index.length) {
    visibleTileIndex = 0;
  } else if (visibleTileIndex < 0) {
    visibleTileIndex = index.length - 1;
  }

  return index[visibleTileIndex];
};

const rotateTile = (forward = true) => {

  if ( ! messaging.isPeerConnected() ) {
    return false;
  }

  setVisibleTile(nextTile(forward));
  vibration.vibrateUi();

  return true;
};

const nextButtonHandler = () => {
  rotateTile(true)
};

const doButtonHandler = () => {
  switch (visibleTile) {
    case "acOn":
      setVisibleTile("console");
      consoleInfo("Climate Start", "Sending Climate Start Request");
      vibration.vibrateUi();
      break;
    case "acOff":
      setVisibleTile("console");
      consoleInfo("Climate Stop", "Sending Climate Stop Request");
      vibration.vibrateUi();
      break;
    default:
      break;
  }
};

export const init = () => {
  logger.trace("tiles.init");

  registerButtonListeners(doButtonHandler, nextButtonHandler);

  // add a listener for when the peer socket closes
  peerSocket.addEventListener('open', (evt) => {
    logger.trace('tiles.peerSocket.onopen');
    consoleWarn("Peer Connect", "Peer is connected");
    setVisibleTile("acOn");
  });

  // add a listener for when the peer socket closes
  peerSocket.addEventListener('close', (evt) => {
    logger.trace('tiles.peerSocket.onclose');
    consoleError("Peer Connect", "Peer disconnected");
    setVisibleTile("console");
  });

  // add a listener for when it closes
  peerSocket.addEventListener('error', (evt) => {
    logger.trace('tiles.peerSocket.onerror');
    consoleError("Peer Connect", "Peer error");
    setVisibleTile("console");
  });

  logger.debug(`tiles.init: isPeerConnected: ${messaging.isPeerConnected()}`);
  if ( messaging.isPeerConnected() ) {
    setVisibleTile("acOn");
  }
};
