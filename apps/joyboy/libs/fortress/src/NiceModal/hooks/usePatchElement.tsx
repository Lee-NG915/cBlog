import React from 'react';
export default function usePatchElement(): [React.ReactElement[], (element: React.ReactElement) => Function] {
  const [elements, setElements] = React.useState<React.ReactElement[]>([]);
  const patchElement = React.useCallback((element: React.ReactElement) => {
    // append a new element to elements (and create a new ref)
    setElements((pre) => [...pre, element]);

    // return a function that removes the new element out of elements (and create a new ref)
    // it works a little like useEffect
    return () => {
      setElements((pre) => pre.filter((e) => e !== element));
    };
  }, []);
  return [elements, patchElement];
}
