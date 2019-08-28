import document from "document";

document.onkeypress = (e) => {

  if (e.key === "up") {
    const powerMask = document.getElementById('power-mask').getElementsByTagName("rect")[0];
    console.log(JSON.stringify(powerMask, null, 2));

    const START = 130;
    const MAX = 300;
    const STEP = 18;

    console.log(`up`);
    e.preventDefault();

    let iter = 0;
    powerMask.width = START;
    const f = setInterval(() => {
      let step = STEP;
      if (iter >= 8) {
       clearInterval(f);
       powerMask.width = 0;
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
