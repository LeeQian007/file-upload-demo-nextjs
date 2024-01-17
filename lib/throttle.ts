type ThrottleFunction = (...args: any[]) => void;

export function throttle(
  func: ThrottleFunction,
  delay: number
): ThrottleFunction {
  let lastExecTime = 0;

  return function (...args: any[]) {
    const now = Date.now();

    if (now - lastExecTime >= delay) {
      func(...args);
      lastExecTime = now;
    }
  };
}
