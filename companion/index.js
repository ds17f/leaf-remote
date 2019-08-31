import * as messaging from "messaging";

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
};

// Listen for the onopen event
messaging.peerSocket.onopen = () => {
  // Ready to send or receive messages
  console.log("Ready to send/receive")
};
