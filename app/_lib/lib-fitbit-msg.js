import * as messaging from "messaging";

let logger = console;
const setLogger = l => {
  logger = l;
};

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
  logger.log("Ready to send/receive")
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  const uiConsole = document.getElementById('console');
  uiConsole.text = evt.data;
  logger.log(JSON.stringify(evt.data));
};


// Send a message to the peer
const sendMessage = (data) => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
  }
};
