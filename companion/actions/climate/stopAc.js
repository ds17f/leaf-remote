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
import { createClimateAction, AC_OFF } from "./_lib/acAction";
import * as messages from "../../../common/messages/stopAc";

const AC_OFF_START = () => Object.assign({}, messages.AC_OFF_START);
const AC_OFF_POLLING = loop => Object.assign({loop: loop}, messages.AC_OFF_POLLING);
const AC_OFF_SUCCESS = () => Object.assign({}, messages.AC_OFF_SUCCESS);
const AC_OFF_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, messages.AC_OFF_TIMEOUT);
const AC_OFF_FAILURE = error => Object.assign({result: error}, messages.AC_OFF_FAILURE);

export const stopAC = getSettings => {
  return createClimateAction(getSettings, AC_OFF, AC_OFF_START, AC_OFF_POLLING, AC_OFF_SUCCESS, AC_OFF_TIMEOUT, AC_OFF_FAILURE);
};

