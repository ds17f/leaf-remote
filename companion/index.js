import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";

console.log(`username: ${settingsStorage.getItem("username")}`);
console.log(`password: ${settingsStorage.getItem("password")}`);

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

if (me.launchReasons.peerAppLaunched) {
  // The Device application caused the Companion to start
  console.log("Device application was launched!");

}

// Listen for the onmessage event
peerSocket.onmessage = (evt) => {
  console.log(`Received message: ${JSON.stringify(evt.data)}`);
  let timer = null;
  let loops = 0;
  const MAX_LOOPS = 3;
  // Output the message to the console
  if (evt.data.type === "API") {
    switch(evt.data.action) {
      case "LOGIN":
        nissanLogin();
        break;
      case "AC_ON":
        sendMessage({type: "API", action: "AC_ON"});
        console.log("simulate AC_ON");
        timer = setInterval(() => {
          console.log(`loop: ${loops}`);
          if (loops >= MAX_LOOPS ){
            clearInterval(timer);
            loops = 0;
            sendMessage({type: "API", action: "AC_SUCCESS"});
            return true;
          }
          sendMessage({type: "API", action: "AC_POLLING"});
        }, 10000);
        break;
      default:
        console.log(`UNKNOWN ACTION: ${evt.data.action}`);
        break;
    }

  }
};

// Listen for the onopen event
peerSocket.onopen = () => {
  // Ready to send or receive messages
  console.log("Ready to send/receive");
  sendSettings();
  sendMessage({type: "CONNECT", action: "BEGIN"});
};

const nissanLogin = () => {
  sendMessage({type: "API", action: "LOGIN_START"});
  console.log("simulate login");
  setTimeout(() => {
    console.log("login complete");
    sendMessage({type: "API", action: "LOGIN_COMPLETE"});
  }, 5000);
};

settingsStorage.onchange = () => {
  sendSettings();
};
