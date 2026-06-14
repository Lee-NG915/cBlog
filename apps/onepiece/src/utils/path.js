export function join(...paths) {
  return paths.reduce((prev, current) => {
    let nextPrev = prev;
    let nextCurrent = current;
    if (prev.slice(-1) === '/') {
      nextPrev = prev.slice(0, -1);
    }
    if (current === '/') {
      nextCurrent = '';
    } else if (current.slice(0, 1) !== '/') {
      nextCurrent = `/${current}`;
    }
    return nextPrev + nextCurrent;
  });
}
