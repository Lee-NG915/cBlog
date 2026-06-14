import { useCallback, useRef } from 'react';

function setStyle(ele, attr, value) {
  if (ele) {
    ele.style[attr] = value;
  }
}

const useAnimate = (goNext, delay = 6000) => {
  const ref = useRef();
  const animate = useCallback(() => {
    const idObj = {};
    idObj.interval = setInterval(() => {
      setStyle(ref.current, 'display', 'block');
      idObj.timmer1 = setTimeout(() => {
        setStyle(ref.current, 'height', '34px');
      }, 200);
      idObj.timmer2 = setTimeout(() => {
        goNext();
        setStyle(ref.current, 'display', 'none');
        setStyle(ref.current, 'height', '0px');
      }, 1000);
    }, delay);
    return idObj;
  }, [delay, goNext]);
  return { animate, ref };
};

export default useAnimate;
