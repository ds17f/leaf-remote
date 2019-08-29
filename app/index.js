import document from "document";


const tiles = ["acOn", "acOff", "console"];

const isRunning = null;

const state = {
  isRunning: false,
  visibleTile: "acOn",
  backendConnect: null,
};

const setVisibleTile = visibleTile => {
  // fade tiles
  document.getElementsByClassName('tile').forEach(t => {
    t.style.display = "none";
  });

  // fade in proper tile
  document.getElementById(visibleTile).style.display = "inline";
};

const powerUp = (currentState) => {
  const powerMask = document.getElementById('power-mask').getElementsByTagName("rect")[0];

  const START = 130;
  const MAX = 300;
  const STEP = 18;

  let iter = 0;
  powerMask.width = START;
  const f = setInterval(() => {
    let step = STEP;
    if (iter >= 8) {
      clearInterval(f);
      powerMask.width = 0;
      currentState.isRunning = null;
      setConsoleText("Complete", "I'm done");
      return;
    }
    if (iter >= 6) {
      step = 27;
    }

    if (powerMask.width >= MAX) {
      powerMask.width = START;
    } else {
      powerMask.width += step;
    }
    iter += 1;
  }, 1000);

  return f;
};
const rotateIcon = () => {
  const iconMask = document.getElementById('icon-mask').getElementsByTagName('rect')[0];
  console.log(JSON.stringify(iconMask, null, 2));

  const START = 80;
  const MAX = 185;
  const STEP = 35;

  console.log("down");
  e.preventDefault();
  if (iconMask.x >= MAX) {
    iconMask.x = START;
  } else {
    iconMask.x += STEP;
  }
};
const rotateTile = (currentState) => {
  let visibleTileIndex = tiles.indexOf(state.visibleTile);
  visibleTileIndex += 1;
  if (visibleTileIndex >= tiles.length) {
    visibleTileIndex = 0;
  }
  state.visibleTile = tiles[visibleTileIndex];
  updateUI(currentState);
};
const setConsoleText = (headText, bodyText) => {
  console.log(`head: ${headText}, body: ${bodyText}`);
  const head = document.getElementById("console-head");
  const body = document.getElementById("console-body");

  head.text = headText;
  body.text = bodyText;
};

const updateUI = currentState => {
  setVisibleTile(currentState.visibleTile);
};

document.onkeypress = (e) => {
  if (e.key === "up") {
    console.log(`up`);
    e.preventDefault();
    if ( ! state.isRunning ) {
      state.isRunning = powerUp(state);
      console.log("start running");
      setConsoleText("Run Me", "I'm running");
      state.visibleTile = "console";
      updateUI(state);
    } else {
      console.log("already running")
    }

  }
  if (e.key === "down") {
    rotateTile(state);
  }
};

