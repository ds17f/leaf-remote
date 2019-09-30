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
import { createClimateAction, AC_ON } from "./_lib/acAction";
import * as messages from "../../../common/messages/startAc";

const AC_ON_START = () => Object.assign({}, messages.AC_ON_START);
const AC_ON_POLLING = loop => Object.assign({loop: loop}, messages.AC_ON_POLLING);
const AC_ON_SUCCESS = () => Object.assign({}, messages.AC_ON_SUCCESS);
const AC_ON_TIMEOUT = (timeout) => Object.assign({timeout: timeout}, messages.AC_ON_TIMEOUT);
const AC_ON_FAILURE = error => Object.assign({result: error}, messages.AC_ON_FAILURE);

export const startAC = getSettings => {
  return createClimateAction(getSettings, AC_ON, AC_ON_START, AC_ON_POLLING, AC_ON_SUCCESS, AC_ON_TIMEOUT, AC_ON_FAILURE);
};

