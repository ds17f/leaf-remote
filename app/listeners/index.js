import * as startAc from './startAc';
import * as stopAc from './stopAc';
import * as login from './login';

export const init = () => {
  startAc.registerListener();
  stopAc.registerListener();
  login.registerListener();
};