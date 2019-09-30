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
import {settingsStorage} from "settings";

import * as messaging from "../fitbit/messaging";
import {sleep} from "../utils";
import { logger } from "../../../common/logger";

const demo_nissanLogin = async () => {
  const username = JSON.parse(settingsStorage.getItem("username")).name;
  const password = JSON.parse(settingsStorage.getItem("password")).name;
  console.log(`u: ${username}, p: ${password}`);
  // const session = createSession(username, password);

  messaging.send(LOGIN_START);
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  const success = Math.random() * 10000 % 100;
  // success 90% of the time
  if (success <= 90) {
    messaging.send(LOGIN_COMPLETE);
  } else {
    const errMessage = Object.assign({error: new Error("Failed because of random")}, LOGIN_FAILED);
    messaging.send(errMessage);
  }

  return {};
};
const demo_startAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  messaging.send(AC_ON_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      messaging.send(AC_ON_SUCCESS);
      return true;
    }
    loop += 1;
    messaging.send(Object.assign({loop: loop}, AC_ON_POLLING));
  }, POLL_RESULT_INTERVAL);
};
const demo_stopAC = async () => {
  const POLL_RESULT_INTERVAL = 5000;
  await demo_nissanLogin();

  // Start
  const factor = Math.random() * 100 % 5;
  await sleep(1000 * factor);
  messaging.send(AC_OFF_START);

  let loop = 0;
  const MAX_LOOPS = Math.random() * 100 % 5;
  const timer = setInterval(() => {
    logger.debug(`loop: ${loop}`);
    if (loop >= MAX_LOOPS ){
      clearInterval(timer);
      loop = 0;
      messaging.send(AC_OFF_SUCCESS);
      return true;
    }
    loop += 1;
    messaging.send(Object.assign({loop: loop}, AC_OFF_POLLING));
  }, POLL_RESULT_INTERVAL);
};