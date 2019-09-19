import document from "document";
import {peerSocket} from "messaging";

import * as messaging from '../fitbit/messaging'
import * as vibration from "./vibration";

import { logger } from "app/lib/logger";


const tiles = ["acOn", "acOff", "console"];
let visibleTile = "console";

const setVisibleTile = newTile => {
  // hide all tiles
  document.getElementsByClassName('tile').forEach(t => {
    t.style.display = "none";
  });

  // show in proper tile
  document.getElementById(newTile).style.display = "inline";

  visibleTile = newTile;
  vibration.vibrateUi();
};

const nextTile = ( forward = true ) => {

  // if we're showing the debug console
  // we'll just pretend we're showing the normal console
  if (visibleTile === "debug") {
    return tiles[0];
  }

  let visibleTileIndex = tiles.indexOf(visibleTile);
  visibleTileIndex += forward ? 1 : -1;

  if (visibleTileIndex >= tiles.length) {
    visibleTileIndex = 0;
  } else if (visibleTileIndex < 0) {
    visibleTileIndex = tiles.length - 1;
  }

  return tiles[visibleTileIndex];
};

const rotateTile = (forward = true) => {

  if ( ! messaging.isPeerConnected() ) {
    return false;
  }

  setVisibleTile(nextTile(forward));

  return true;
};

export const init = () => {
  document.addEventListener('keypress', (e) => {
    if (e.key === "down") {
      e.preventDefault();
      rotateTile(true)
    }
  });

  peerSocket.addEventListener('message', (evt) => {
    setVisibleTile("console");
  });
};
