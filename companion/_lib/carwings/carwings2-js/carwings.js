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
/*
When logging in, you must specify a geographic 'region' parameter. The only
known values for this are as follows:

    NNA  : USA
    NE   : Europe
    NCI  : Canada
    NMA  : Australia
    NML  : Japan

Information about Nissan on the web (e.g. http://nissannews.com/en-US/nissan/usa/pages/executive-bios)
suggests others (this page suggests NMEX for Mexico, NLAC for Latin America) but
these have not been confirmed.

There are three asynchronous operations in this API, paired with three follow-up
"status check" methods.

    request_update           -> get_status_from_update
    start_climate_control    -> get_start_climate_control_result
    stop_climate_control     -> get_stop_climate_control_result

The asynchronous operations immediately return a 'result key', which
is then supplied as a parameter for the corresponding status check method.

Here's an example response from an asynchronous operation, showing the result key:

    {
        "status":200,
        "userId":"user@domain.com",
        "vin":"1ABCDEFG2HIJKLM3N",
        "resultKey":"12345678901234567890123456789012345678901234567890"
    }

The status check methods return a JSON blob containing a 'responseFlag' property.
If the communications are complete, the response flag value will be the string "1";
otherwise the value will be the string "0". You just gotta poll until you get a
"1" back. Note that the official app seems to poll every 20 seconds.

Example 'no response yet' result from a status check invocation:

    {
        "status":200,
        "responseFlag":"0"
    }

When the responseFlag does come back as "1", there will also be an "operationResult"
property. If there was an error communicating with the vehicle, it seems that
this field will contain the value "ELECTRIC_WAVE_ABNORMAL". Odd.
*/

// import { createCipheriv } from "crypto";
// import fetch from 'node-fetch';
// import Blowfish from './vendor/Blowfish';
import Blowfish from './vendor/dojo_blowfish';

// import axios from "axios";
// import querystring from "querystring";
// import moment from "moment";

const querystring = {
  stringify: (params) => {
    let delimiter = "";
    let out = "";
    Object.keys(params).forEach(key => {
      out += `${delimiter}${key}=${encodeURIComponent(params[key])}`;
      if (! delimiter) {
        delimiter = "&"
      }
    });
    logger.debug(`qstring: ${out}`);
    return out;
  }
};

const axios = {
  post: (URL, params) => {
    return fetch(URL, {
      body: params,
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    })
  }
};

let logger = {
  error: (...m) => console.error(...m),
  warn: (...m) => console.warn(...m),
  info: (...m) => console.info(...m),
  debug: (...m) => console.log(...m)
};
export const setLogger = extLogger => {
  logger = extLogger;
};

export const BASE_URL = "https://gdcportalgw.its-mo.com/api_v190426_NE/gdc/";
export const DEFAULT_REGION_CODE = "NNA";
export const INITIAL_APP_STR = "9s5rfKVuMrT03RtzajWNcA";

const parseCarwingsResponse = data => {
  const opResult = data.operationResult || data.OperationResult;

  // seems to indicate that the vehicle cannot be reached
  if (opResult === "ELECTRIC_WAVE_ABNORMAL") {
    logger.error("could not establish communications with vehicle");
    throw Error("could not establish communications with vehicle");
  }

  const carwingsResponse = {};
  carwingsResponse.setCruisingRanges = (
    status,
    offKey = "cruisingRangeAcOff",
    onKey = "crusingRangeAcOn"
  ) => {
    carwingsResponse.cruisingRangeAcOffKm = status[offKey]
      ? status[offKey] / 1000
      : status[onKey] / 1000;
  };
  carwingsResponse.setTimestamp = status => {
    // TODO: parse the datetime
    carwingsResponse.timestamp = new Date(status.timeStamp).toISOString();
  };

  return carwingsResponse;
};

const parseCarwingsInitialAppResponse = data => {
  const intialAppResponse = parseCarwingsResponse(data);
  intialAppResponse.baseprm = data.baseprm;
  return intialAppResponse;
};

const parseCarwingsLoginResponse = data => {
  const response = parseCarwingsResponse(data);

  const { profile } = data.vehicle;
  response.gdcUserId = profile.gdcUserId;
  response.dcmId = profile.dcmId;
  response.vin = profile.vin;

  // vehicleInfo block may be top level, or contained in a VehicleInfoList object;
  // why it's sometimes one way and sometimes another is not clear.
  const vehicleInfo = data.VehicleInfoList
    ? data.VehicleInfoList.vehicleInfo
    : data.vehicleInfo;
  response.nickname = vehicleInfo[0].nickname;
  response.customSessionId = vehicleInfo[0].custom_sessionid;

  const customerInfo = data.CustomerInfo;
  response.tz = customerInfo.Timezone;
  response.language = customerInfo.Language;
  response.userVehicleBoundTime = customerInfo.VehicleInfo.UserVehicleBoundTime;

  response.leafs = [
    {
      vin: response.vin,
      nickname: response.nickname,
      boundTime: response.userVehicleBoundTime
    }
  ];

  return response;
};

const parseCarwingsBatteryStatusResponse = data => {
  const batteryResponse = parseCarwingsResponse(data);
  batteryResponse.setTimestamp(data);
  batteryResponse.setCruisingRanges(data);
  batteryResponse.answer = data;

  batteryResponse.batteryCapacity = data.batteryCapacity;
  batteryResponse.batteryDegradation = data.batteryDegradation;

  batteryResponse.isConnected = data.pluginState !== "NOT_CONNECTED";
  batteryResponse.pluginState = data.pluginState;

  batteryResponse.chargingStatus = data.chargeMode;

  batteryResponse.isCharging = data.charging === "YES";

  batteryResponse.isQuickCharging = data.chargeMode === "RAPIDLY_CHARGING";
  batteryResponse.isConnectedToQuickCharger =
    data.pluginState === "QC_CONNECTED";

  // batteryResponse.timeToFullTrickle = moment(new Date())
  //   .add(data.timeRequiredToFull, "m")
  //   .toDate();
  // batteryResponse.timeToFullL2 = moment(new Date())
  //   .add(data.timeRequiredToFull200, "m")
  //   .toDate();
  // batteryResponse.timeToFullL26kw = moment(new Date())
  //   .add(data.timeRequiredToFull200_6kw, "m")
  //   .toDate();

  return batteryResponse;
};

const parseCarwingsStartClimateControlResponse = data => {
  const climateResponse = parseCarwingsResponse(data);
  climateResponse.setTimestamp(data);
  climateResponse.setCruisingRanges(data);

  climateResponse.operationResult = data.operationResult;
  // climateResponse.acContinueTime = moment(new Date())
  //   .add(data.acContinueTime, "m")
  //   .toDate();
  climateResponse.hvacStatus = data.hvacStatus;
  climateResponse.isHvacRunning = climateResponse.hvacStatus === "ON";

  return climateResponse;
};

const parseCarwingsStopClimateControlResponse = data => {
  const climateResponse = parseCarwingsResponse(data);
  climateResponse.setTimestamp(data);

  climateResponse.hvacStatus = data.hvacStatus;
  climateResponse.isHvacRunning = climateResponse.hvacStatus === "ON";

  return climateResponse;
};

const parseCarwingsLatestBatteryStatus = data => {
  const batteryResponse = parseCarwingsResponse(data.BatteryStatusRecords);
  batteryResponse.answer = data;

  const records = data.BatteryStatusRecords;
  const battStatus = records.BatteryStatus;
  batteryResponse.timestamp = new Date(records.OperationDateAndTime);

  batteryResponse.batteryCapacity = battStatus.BatteryCapacity;
  batteryResponse.batteryRemainingAmount = battStatus.BatteryRemainingAmount;
  batteryResponse.chargingStatus = battStatus.BatteryChargingStatus;
  batteryResponse.isCharging =
    battStatus.BatteryChargingStatus !== "NOT_CHARGING";
  batteryResponse.isQuickCharging =
    battStatus.BatteryChargingStatus === "RAPIDLY_CHARGING";
  batteryResponse.pluginState = records.PluginState;
  batteryResponse.isConnected = records.PluginState !== "NOT_CONNECTED";
  batteryResponse.isConnectedToQuickCharger =
    records.PluginState === "QC_CONNECTED";
  batteryResponse.setCruisingRanges(
    records,
    "CruisingRangeAcOff",
    "CruisingRangeAcOn"
  );

  // batteryResponse.timeToFullTrickle = records.TimeRequredToFull
  //   ? moment(new Date())
  //       .add(records.TimeRequiredToFull, "m")
  //       .toDate()
  //   : null;
  //
  // batteryResponse.timeToFullL2 = records.TimeRequredToFull200
  //   ? moment(new Date())
  //       .add(records.TimeRequiredToFull200, "m")
  //       .toDate()
  //   : null;
  //
  // batteryResponse.timeToFullL26kw = records.TimeRequredToFull200_6kw
  //   ? moment(new Date())
  //       .add(records.TimeRequiredToFull200_6kw, "m")
  //       .toDate()
  //   : null;

  if (batteryResponse.batteryCapacity === 0) {
    logger.debug(`battery_capacity=0, status=${JSON.stringify(data)}`);
    batteryResponse.batteryPercent = 0;
  } else {
    batteryResponse.batteryPercent =
      (100 * batteryResponse.batteryRemainingAmount) / 12;
  }

  // 2016 LEAF has SOC (State Of Charge) in BatteryStatus, a more accurate battery percentage
  if (battStatus.SOC) {
    batteryResponse.stateOfCharge = battStatus.SOC.Value;
    batteryResponse.batteryPercent = batteryResponse.stateOfCharge;
  } else {
    batteryResponse.stateOfCharge = null;
  }

  return batteryResponse;
};

const encryptBlowfishECB = (key, text) => {
  return (Blowfish.encrypt(text, key, { outputType: 0, cipherMode: 0}))

};

const encryptBlowfishECB_rus = (key, text) => {
  const bf = new Blowfish(key);
  const encrypted = bf.encrypt(text);
  const b64 = bf.base64Encode(encrypted);
  console.log(`new: ${b64}`);
  encryptBlowfishECB_old(key, text)
  return b64;
};

const encryptBlowfishECB_old = (key, text) => {
  const cipher = createCipheriv("bf-ecb", key, "");
  let encrypted = cipher.update(text, "utf-8", "base64");
  console.log(`old: ${encrypted}`);
  const final = cipher.final("base64");
  console.log(`final: ${final}`);
  encrypted += final;
  console.log(`old2: ${encrypted}`);
  return encrypted;
};

const createLeafRemote = (session, leafData) => {
  const makeRequestParmsMin = additionalParms => {
    const requestParms = {
      RegionCode: session.regionCode,
      VIN: leafData.vin
    };

    return !additionalParms
      ? requestParms
      : Object.assign(requestParms, additionalParms);
  };
  const makeRequestParms = additionalParms => {
    const requestParms = makeRequestParmsMin({
      lg: session.language,
      DCMID: session.dcmId,
      tz: session.tz
    });

    return !additionalParms
      ? requestParms
      : Object.assign(requestParms, additionalParms);
  };

  const leafRemote = {
    session,
    vin: leafData.vin,
    nickname: leafData.nickname,
    boundTime: leafData.boundTime,
    requestUpdate: async () => {
      logger.warn("Request battery status update...");
      // TODO: should be requestWithRetry
      const response = await session.request(
        "BatteryStatusCheckRequest.php",
        makeRequestParmsMin()
      );
      return response.resultKey;
    },
    getStatusFromUpdate: async resultKey => {
      logger.warn("Check battery status update request...");
      // TODO: should be requestWithRetry
      const response = await session.request(
        "BatteryStatusCheckResultRequest.php",
        makeRequestParms({ resultKey })
      );
      // responseFlag will be "1" if a response has been returned; else "0".
      if (response.responseFlag === "1") {
        return parseCarwingsBatteryStatusResponse(response);
      }
      logger.info("responseFlag === 0");
      logger.info(`response: ${JSON.stringify(response, null, 2)}`);

      return undefined;
    },
    startClimateControl: async () => {
      logger.warn("Request climate control START...");
      const response = await session.request(
        "ACRemoteRequest.php",
        makeRequestParms()
      );
      return response.resultKey;
    },
    getStartClimateControlRequest: async resultKey => {
      logger.warn("Checking climate control START request...");
      // TODO: should be requestWithRetry
      const response = await session.request(
        "ACRemoteResult.php",
        makeRequestParms({ UserId: session.gdcUserId, resultKey })
      );
      if (response.responseFlag === "1") {
        return parseCarwingsStartClimateControlResponse(response);
      }

      return undefined;
    },
    stopClimateControl: async () => {
      logger.warn("Request climate control STOP...");
      const response = await session.request(
        "ACRemoteOffRequest.php",
        makeRequestParms()
      );
      return response.resultKey;
    },
    getStopClimateControlRequest: async resultKey => {
      logger.warn("Checking climate control STOP request...");
      // TODO: should be requestWithRetry
      const response = await session.request(
        "ACRemoteOffResult.php",
        makeRequestParms({ UserId: session.gdcUserId, resultKey })
      );
      if (response.responseFlag === "1") {
        return parseCarwingsStopClimateControlResponse(response);
      }

      return undefined;
    },
    getLatestBatteryStatus: async () => {
      logger.warn("Getting latest battery status...");
      const response = await session.request(
        "BatteryStatusRecordsRequest.php",
        makeRequestParms({ TimeFrom: session.boundTime })
      );
      if (response.BatteryStatusRecords) {
        return parseCarwingsLatestBatteryStatus(response);
      }

      logger.warn("No battery status record returned by server");
      logger.info(JSON.stringify(response));
      return null;
    }
  };
  logger.warn(`created leafRemote ${leafRemote.vin}/${leafRemote.nickname}`);

  return leafRemote;
};

export const createSession = (
  username,
  password,
  region = DEFAULT_REGION_CODE
) => {
  const session = {
    username,
    password,
    regionCode: region,
    loggedIn: false,
    customSessionId: null
  };

  const request = async (endpoint, inputParams) => {
    const params = inputParams;
    params.initial_app_str = INITIAL_APP_STR;
    params.custom_sessionid = session.customSessionId
      ? session.customSessionId
      : "";

    const url = BASE_URL + endpoint;

    logger.info(`invoking carwings API: ${url}`);
    logger.debug(`params: ${JSON.stringify(params)}`);

    let res;
    try {
      res = await axios.post(url, querystring.stringify(params));
      logger.debug(`res: ${JSON.stringify(res)}`);
      res.data = await res.json();
      logger.debug(`Response config: ${JSON.stringify(res.config, null, 2)}`);
      logger.debug(`Response HTTP Status Code: ${res.status}`);
      logger.debug(
        `Response HTTP Response Body: ${JSON.stringify(res.data, null, 2)}`
      );
    } catch (ex) {
      logger.warn(`HTTP Request Failed`);
      logger.error(ex);
      throw ex;
    }

    /*
     * Nissan servers can return html instead of jSOn on occassion, e.g.
     *
     * <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//END>
     * <html<head>
     *    <title>503 Service Temporarily Unavailable</title>
     * </head><body>
     * <h1>Service Temporarily Unavailable>
     * <p>The server is temporarily unable to service your
     * request due to maintenance downtime or capacity
     * problems. Please try again later.</p>
     * </body></html>
     */
    if (!res.data || typeof res.data === "string") {
      logger.error("Invalid JSON returned");
      throw new Error("Invalid JSON returned");
    }

    if (res.data.message && res.data.message === "INVALID PARAMS") {
      logger.error(`carwings error ${res.data.message}, ${res.data.status}`);
      throw new Error("INVALID PARAMS");
    }

    if (res.data.ErrorMessage) {
      logger.error(`carwings error ${res.data.ErrorCode}, ${res.data.ErrorMessage}`);
      throw new Error(`${res.data.ErrorCode},${res.data.ErrorMessage}`)
    }

    return res.data;
  };

  const connect = async () => {
    session.customSessionId = null;
    session.loggedIn = false;

    logger.warn("Logging in to Nissan Servers...");
    const initialAppResponse = await request("InitialApp_v2.php", {
      RegionCode: session.regionCode,
      lg: "en-US"
    });
    const parsedInitial = parseCarwingsInitialAppResponse(initialAppResponse);
    const encryptedPassword = encryptBlowfishECB(
      parsedInitial.baseprm,
      session.password
    );

    const loginResponse = await request("UserLoginRequest.php", {
      RegionCode: session.regionCode,
      UserId: session.username,
      Password: encryptedPassword
    });

    const parsedLogin = parseCarwingsLoginResponse(loginResponse);
    session.customSessionId = parsedLogin.customSessionId;
    session.gdcUserId = parsedLogin.gdcUserId;
    session.dcmId = parsedLogin.dcmId;
    session.tz = parsedLogin.tz;
    session.language = parsedLogin.language;

    logger.warn("Login complete.");

    session.leafRemote = createLeafRemote(session, parsedLogin.leafs[0]);

    logger.debug(`vin ${parsedLogin.vin}`);
    logger.debug(`nickname ${parsedLogin.nickname}`);

    session.loggedIn = true;

    return parsedLogin;
  };

  session.request = request;
  session.connect = connect;
  return session;
};
