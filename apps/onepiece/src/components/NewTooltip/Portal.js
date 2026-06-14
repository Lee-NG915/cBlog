import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
  const portal = document.getElementById('portal');
  const el = document.createElement('div');

  useEffect(() => {
    portal.appendChild(el);
    return () => portal.removeChild(el);
  }, [el, portal]);

  return createPortal(children, el);
};

export { Portal };
