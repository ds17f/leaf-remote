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
import document from "document";
import * as messaging from "../fitbit/messaging";
import * as vibration from "./vibration";
import {nextTile} from "./tiles";

const icons = {
  notConnected: 80,
  connecting: 115,
  connected: 150,
  failed: 185
};


const setCompanionIcon = currentState => {
  const iconMask = document.getElementById('icon-mask').getElementsByTagName('rect')[0];
  iconMask.x = icons[currentState.companionConnect];
};

const setDemoVisible = currentState => {
  const demoIcon = document.getElementById("demo");
  demoIcon.style.display = currentState.isDemo
    ? "inline"
    : "none";
};

export const updateUI = currentState => {
  setCompanionIcon(currentState);
  setDemoVisible(currentState);
};


