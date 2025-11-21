// Polyfill for Promise.withResolvers
// Required for Node.js < 22
if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
