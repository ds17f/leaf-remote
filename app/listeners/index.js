import * as startAc from './startAc';
import * as stopAc from './stopAc';
import * as login from './login';

export const toggleStayAlive = on => {
  startAc.toggleStayAlive(on);
  stopAc.toggleStayAlive(on);
};

export const init = () => {
  startAc.registerListener();
  stopAc.registerListener();
  login.registerListener();
};