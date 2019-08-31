export const addTouch = (uiComponent, clickCallback, leftCallback, rightCallback, upCallback, downCallback) => {
  let xPos = 0;
  let yPos = 0;
  const mouseDownHandler = evt => {
    xPos = evt.screenX;
    yPos = evt.screenY;
  };
  const mouseUpHandler = evt => {
    const xChange = evt.screenX - xPos;
    const yChange = evt.screenY - yPos;
    const threshold = 60;

    if ( xChange < -threshold) {
      leftCallback && leftCallback(xPos, yPos);
      return;
    }
    if ( xChange > threshold) {
      rightCallback && rightCallback(xPos, yPos);
      return;
    }
    if ( yChange < -threshold) {
      upCallback && upCallback(xPos, yPos);
      return;
    }
    if ( yChange > threshold) {
      downCallback && downCallback(xPos, yPos);
      return;
    }
    // change hasn't been a swipe, must be a touch
    clickCallback();
  };

  uiComponent.onmousedown = mouseDownHandler;
  uiComponent.onmouseup = mouseUpHandler;
};