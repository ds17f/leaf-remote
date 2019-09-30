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
import { registerActionListener } from "../../_lib/fitbit/messaging";
import { startAC } from '../../actions/climate/startAc';
import * as messages from "../../../common/messages/startAc";

export const registerListener = getSettings => {
  const startAcAction = startAC(getSettings);
  registerActionListener(messages.AC_ON_START, startAcAction);
};
