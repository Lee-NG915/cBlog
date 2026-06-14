import { useState, useCallback } from 'react';

const useIndex = (index, array) => {
  const [current, setCurrent] = useState(index);
  const [next, setNext] = useState(() => (index + 1 > array.length - 1 ? 0 : index + 1));
  const goNext = useCallback(() => {
    setCurrent((last) => {
      if (last === array.length - 1) {
        return 0;
      }
      return last + 1;
    });
    setNext((last) => {
      if (last === array.length - 1) {
        return 0;
      }
      return last + 1;
    });
  }, [array]);
  return {
    current,
    next,
    goNext,
  };
};

export default useIndex;
