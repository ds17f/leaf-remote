import document from "document";

document.onkeypress = (e) => {

  if (e.key === "up") {
    const powerMask = document.getElementById('power-mask-img');
    console.log(JSON.stringify(powerMask, null, 2));

    const START = 100;
    const MAX = 300;
    const STEP = 20;

    console.log(`up`);
    e.preventDefault();
    if (powerMask.width >= MAX) {
      powerMask.width = START;
    } else {
      powerMask.width += STEP;
    }
    e.preventDefault();

  }
  if (e.key === "down") {
    const iconMask = document.getElementById('icon-mask-rect');
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
