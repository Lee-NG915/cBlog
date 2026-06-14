/* eslint-disable no-promise-executor-return */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const retryOperation = (operation, breakPoint, delay, times) =>
  new Promise((resolve, reject) => {
    const handle = () => {
      if (breakPoint()) {
        resolve();
      } else {
        throw new Error('Something went wrong. Please try again later');
      }
    };
    return operation()
      .then(handle)
      .catch((reason) => {
        if (times - 1 > 0) {
          return wait(delay)
            .then(retryOperation.bind(null, operation, breakPoint, delay, times - 1))
            .then(resolve)
            .catch(reject);
        }
        return reject(reason);
      });
  });
