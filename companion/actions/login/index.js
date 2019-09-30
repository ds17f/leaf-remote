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
import { createSession } from '../../_lib/carwings/carwings2-js/carwings';
import * as messaging from "../../_lib/fitbit/messaging";
import * as messages from "../../../common/messages/login";

const LOGIN_START = () => Object.assign({}, messages.LOGIN_START);
const LOGIN_COMPLETE = () => Object.assign({}, messages.LOGIN_COMPLETE);
const LOGIN_FAILED = error => Object.assign({error: error.toString()}, messages.LOGIN_FAILED);

export const nissanLogin = async (username, password) => {
  const session = createSession(username, password);

  messaging.send(LOGIN_START());
  try {
    await session.connect();
    messaging.send(LOGIN_COMPLETE());
  } catch (error) {
    messaging.send(LOGIN_FAILED(error));
  }

  return session;
};
