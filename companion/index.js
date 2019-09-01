import { peerSocket } from "messaging";
import { me } from "companion"

const sendMessage = (data) => {
  try {
    peerSocket.send(data);
  } catch (error) {
    console.log(`couldn't send "${JSON.stringify(data)}": ${error}`)
  }
};

if (me.launchReasons.peerAppLaunched) {
  // The Device application caused the Companion to start
  console.log("Device application was launched!");

}

// Listen for the onmessage event
peerSocket.onmessage = (evt) => {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
};

// Listen for the onopen event
peerSocket.onopen = () => {
  // Ready to send or receive messages
  console.log("Ready to send/receive");
  sendMessage("companion online");
};
