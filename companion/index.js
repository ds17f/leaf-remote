import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

const logger = console;
logger.debug = m => console.log(m);

const sendMessage = (data) => {
  try {
    console.log(`Sending message: ${JSON.stringify(data)}`);
    peerSocket.send(data);
  } catch (error) {
    console.log(`couldn't send "${JSON.stringify(data)}": ${error}`)
  }
};
const sendSettings = () => {
  const settings = {
    debug: settingsStorage.getItem("debug")
  };
  sendMessage({type: "SETTINGS", settings: settings });
};

const parseAPIMessage = action => {
  let timer = null;
  let loops = 0;
  const MAX_LOOPS = 3;

  switch(action) {
    case "LOGIN":
      nissanLogin();
      break;
    case "AC_ON":
      sendMessage({type: "API", action: "AC_ON"});
      logger.debug("simulate AC_ON");
      timer = setInterval(() => {
        logger.debug(`loop: ${loops}`);
        if (loops >= MAX_LOOPS ){
          clearInterval(timer);
          loops = 0;
          sendMessage({type: "API", action: "AC_SUCCESS"});
          return true;
        }
        loops += 1;
        sendMessage({type: "API", action: "AC_POLLING", loop: loops});
      }, 10000);
      break;
    default:
      logger.error(`Unknown API Action: ${action}`);
      break;
  }

};
const parsePeerMessage = data => {
  switch (data.type) {
    case "API":
      parseAPIMessage(data.action);
      break;
    default:
      logger.error(`Unknown message type: ${data.type}`)
  }
};
const setupPeerConnection = () => {

  // Listen for the onmessage event
  peerSocket.onmessage = evt => {
    console.log(`Received message: ${JSON.stringify(evt.data)}`);
    parsePeerMessage(evt.data);

    // // Output the message to the console
    // if (evt.data.type === "API") {
    //   switch(evt.data.action) {
    //     case "LOGIN":
    //       nissanLogin();
    //       break;
    //     case "AC_ON":
    //       sendMessage({type: "API", action: "AC_ON"});
    //       console.log("simulate AC_ON");
    //       timer = setInterval(() => {
    //         console.log(`loop: ${loops}`);
    //         if (loops >= MAX_LOOPS ){
    //           clearInterval(timer);
    //           loops = 0;
    //           sendMessage({type: "API", action: "AC_SUCCESS"});
    //           return true;
    //         }
    //         sendMessage({type: "API", action: "AC_POLLING"});
    //       }, 10000);
    //       break;
    //     default:
    //       console.log(`UNKNOWN ACTION: ${evt.data.action}`);
    //       break;
    //   }
    //
    // }
  };

  // Listen for the onopen event
  peerSocket.onopen = () => {
    // Ready to send or receive messages
    console.log("Ready to send/receive");
    sendSettings();
    sendMessage({type: "CONNECT", action: "BEGIN"});
  };

};
const setupSettings = () => {
  logger.debug(`username: ${settingsStorage.getItem("username")}`);
  logger.debug(`password: ${settingsStorage.getItem("password")}`);
  logger.debug(`debug: ${settingsStorage.getItem("debug")}`);
  settingsStorage.onchange = () => {
    sendSettings();
  };
};

const init = () => {
  logger.debug("---- Start Companion ----");
  setupPeerConnection();
  setupSettings();
};

init();


const nissanLogin = () => {
  sendMessage({type: "API", action: "LOGIN_START"});
  console.log("simulate login");
  setTimeout(() => {
    console.log("login complete");
    sendMessage({type: "API", action: "LOGIN_COMPLETE"});
  }, 5000);
};
