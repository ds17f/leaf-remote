export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
export const sleepSeconds = s => {
  return sleep(s * 1000)
};

export default sleep;
