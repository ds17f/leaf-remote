import document from "document";

const isRunning = null;
const powerUp = () => {
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
      isRunning = null;
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

document.onkeypress = (e) => {
  if (e.key === "up") {
    console.log(`up`);
    e.preventDefault();
    if ( ! isRunning ) {
      isRunning = powerUp();
      console.log("start running")
    } else {
      console.log("already running")
    }

  }
  if (e.key === "down") {
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
  }
};
