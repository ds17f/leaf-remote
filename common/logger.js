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
export const levels = {
  TRACE: -1,
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
let level = levels.TRACE;
export const setLogLevel = newLevel => {
  level = newLevel
};

export const logger = {
  trace: (m) => (level <= levels.TRACE) && console.log(m),
  vibrate: (m) => (level <= levels.DEBUG && console.warn(`~~~ ${m} ~~~`)),
  debug: (m) => (level <= levels.DEBUG) && console.log(m),
  info: (m) => (level <= levels.INFO) && console.info(m),
  warn: (m) => (level <= levels.WARN) && console.warn(m),
  error: (m) => (level <= levels.ERROR) && console.error(m),
};
