import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';

import style from './style.scss';

const MobileModal = ({ content, head, foot, height, open, close, clear }) => {
  const modalRef = useRef(null);

  const stateRef = useRef(Boolean(open));

  useEffect(() => {
    stateRef.current = Boolean(open);
  });

  const y = useMotionValue(typeof window !== 'undefined' ? window.innerHeight : 0);

  const handleDrag = useCallback(
    (_, { delta }) => {
      y.set(Math.max(y.get() + delta.y, 0));
    },
    [y]
  );

  const handleDragEnd = useCallback(
    (_, { velocity }) => {
      if (velocity.y > 500) {
        close();
      } else {
        const modal = modalRef.current;
        const contentHeight = modal.getBoundingClientRect().height;
        if (y.get() / contentHeight > 0.6) {
          close();
        } else {
          animate(y, 0, {
            type: 'spring',
            ...{ stiffness: 300, damping: 30, mass: 0.2 },
          });
        }
      }
    },
    [close, y]
  );

  const animationComplete = useCallback(() => {
    if (!stateRef.current && clear) {
      clear();
    }
  }, [clear]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          drag="y"
          style={{ height: '100%', width: '100%' }}
          dragConstraints={{ bottom: 0, top: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            style={{ height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={style.newMobileModal}
            style={{
              height: `${height}%`,
            }}
          >
            <motion.div
              layout
              ref={modalRef}
              style={{ height: '100%', y, display: 'flow-root' }}
              initial={{ y: window.innerHeight }}
              animate={{ y: 0, transition: { type: 'tween' } }}
              exit={{ y: window.innerHeight }}
              onAnimationComplete={animationComplete}
            >
              <div className={`${style.newMobileModal}__head`} />
              <div className={`${style.newMobileModal}__content`}>
                {head}
                {content}
                {foot}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

MobileModal.propTypes = {
  content: PropTypes.node,
  head: PropTypes.node,
  foot: PropTypes.node,
  height: PropTypes.number,
  open: PropTypes.bool,
  close: PropTypes.func,
  clear: PropTypes.func,
};

export default MobileModal;
