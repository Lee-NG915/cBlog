import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import style from './style.scss';

const ModalWrapper = ({ children, label, className, isEntered, ...rest }) => {
  const modalRef = useRef(null);
  const [focusableModalElements, setFocusableModalElements] = useState([]);

  useEffect(() => {
    setFocusableModalElements(
      modalRef.current.querySelectorAll(
        'a[href], input:not([disabled]), input:not([hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"], [contenteditable]'
      )
    );
  }, []);

  useEffect(() => {
    // const focusedElementBeforeModal = document.activeElement;
    if (isEntered && focusableModalElements.length > 0) {
      const firstElement = focusableModalElements[0];
      const lastElement = focusableModalElements[focusableModalElements.length - 1];

      firstElement?.focus?.({
        preventScroll: true,
      });

      const handleTabKey = (e) => {
        if (e.keyCode === 9) {
          // SHIFT + TAB
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus?.();
            }
            // TAB
          } else if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus?.();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [focusableModalElements, isEntered]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`${style.modalWrapper}${className ? ` ${className}` : ''} `}
      {...rest}
    >
      {children}
    </div>
  );
};

ModalWrapper.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isEntered: PropTypes.bool,
  rest: PropTypes.array,
};

export default ModalWrapper;
