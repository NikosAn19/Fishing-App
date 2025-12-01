// Polyfill for Promise.withResolvers (ES2024)
// Required by matrix-js-sdk v34+
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

// Ensure global Buffer is available (often needed by crypto libraries)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
