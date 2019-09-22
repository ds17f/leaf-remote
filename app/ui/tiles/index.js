import document from "document";
import {peerSocket} from "messaging";

import { CONNECT_BEGIN } from "../../../common/actions/connect.js";

import * as messaging from "../../fitbit/messaging";
import { logger } from "../../../common/logger";

import * as vibration from "../vibration";


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
  vibration.vibrateUi();
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

  return true;
};

export const init = () => {
  logger.debug("tiles.init");
  document.addEventListener('keypress', (e) => {
    if (e.key === "down") {
      e.preventDefault();
      rotateTile(true)
    }
    if (e.key === "up") {
      e.preventDefault();
      switch (visibleTile) {
        case "acOn":
          setVisibleTile("console");
          break;
        case "acOff":
          setVisibleTile("console");
          break;
        case "console":
          setVisibleTile("console-debug");
          break;
        case "console-debug":
          setVisibleTile("console");
          break;
        default:
          break;
      }
    }
  });

  messaging.registerActionListener(CONNECT_BEGIN, () => {
    logger.debug(`tiles: Connect Begin Received`);
    setVisibleTile("acOn");
  });

  logger.debug(`tiles.init: isPeerConnected: ${messaging.isPeerConnected()}`);
  if ( messaging.isPeerConnected() ) {
    setVisibleTile("acOn");
  }
};
