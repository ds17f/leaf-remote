/**
 * Copyright 2019 Damian Silbergleith Cunniff
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { me } from "appbit";

import * as settings from './_lib/fitbit/settings';
import * as messaging from './_lib/fitbit/messaging'

import * as tiles from './ui/tiles';
import * as peerConnection from './ui/peerConnection';
import * as demo from './ui/demo';
import * as buttons from './ui/buttons';

import * as actions from './actions';
import * as listeners from './listeners';

import { logger, levels, setLogLevel } from "../common/logger";

const settingsUpdateHandler = settings => {
  setLogLevel(settings.logLevel);
  demo.toggleDemoFlag(settings.demo);
  buttons.swapButtons(settings.swapButtons);
  listeners.toggleStayAlive(settings.stayAlive);
};

const init = () => {
  setLogLevel(levels.TRACE);
  logger.warn("---- Starting up ----");

  settings.init(settingsUpdateHandler);
  messaging.init();
  actions.init();
  listeners.init();

  tiles.init();
  peerConnection.init();

  logger.debug("disable app timeout");
  me.appTimeoutEnabled = false;

  logger.debug("Start up complete");
};
init();


