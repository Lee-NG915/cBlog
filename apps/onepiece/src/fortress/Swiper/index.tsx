import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useInterval from 'fortress/hooks/useInterval';

const defaultTransition = 'all 0.5s linear 0s';

export type SwiperProps = {
  direction?: 'to-right' | 'to-left' | 'to-bottom' | 'to-top';
  transitionTimingFunc?: string;
  duration?: number;
  isInfinity?: boolean;
  interval?: number;
  hoverToStop?: boolean;
  children: React.ReactNode[];
  outerClass?: string;
  extendWidth?: number;
};
// type DirectionMapping = {
//   'to-left': 'left';
//   'to-right': 'right';
//   'to-top': 'top';
//   'to-bottom': 'bottom';
// };
const Swiper = ({
  direction = 'to-right',
  transitionTimingFunc = defaultTransition,
  duration = 1,
  isInfinity = true,
  interval = 1000,
  hoverToStop = false,
  children,
  outerClass,
  extendWidth = 0,
}: SwiperProps) => {
  const [index, setIndex] = useState(0);
  const [outerRange, setOuterRange] = useState({
    width: 0,
    height: 0,
  });
  const [initTransition, setInitTransition] = useState(defaultTransition);
  const [initInterval, setInitInterval] = useState<number | null>(interval + duration * 1000);
  const [moveLen, setMoveLen] = useState(0);
  const [initChildren, setInitChildren] = useState<React.ReactNode[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const swiperDirection = useMemo(() => {
    return direction === 'to-left' || direction === 'to-right' ? 'row' : 'column';
  }, [direction]);
  const moveDirection = useMemo(() => {
    return direction.split('-')[1];
  }, [direction]);
  useEffect(() => {
    if (direction === 'to-bottom' || direction === 'to-right') {
      setInitChildren([...children].reverse()); // 注意这里的修改
    } else {
      // 抱歉，如果你在 debug 的时候看到这行注释，这里处理的不是很好，希望你能修改它 ^_^
      if (direction === 'to-left') {
        children = children.map((item) => {
          return <div style={{ flexShrink: 0 }}>{item}</div>;
        });
      }
      setInitChildren([...children]);
    }
  }, [children]);
  useEffect(() => {
    if (children) {
      const childNodesArray = Array.from(listRef.current?.childNodes || []);
      let maxChildLen = 0;
      const childLen = swiperDirection === 'row' ? 'clientWidth' : 'clientHeight';
      childNodesArray.forEach((item) => {
        if (item instanceof HTMLElement) {
          if (item[childLen] > maxChildLen) {
            maxChildLen = item[childLen];
          }
        }
      });
      if (listRef.current !== null && listRef.current.firstChild instanceof HTMLElement) {
        setOuterRange({
          width: swiperDirection === 'row' ? maxChildLen : listRef.current.clientWidth,
          height: swiperDirection === 'row' ? listRef.current.clientHeight : maxChildLen,
        });
      } else {
        console.log('Node is not an HTMLElement with layout.');
      }
    }
  }, [children, listRef.current]);
  useEffect(() => {
    setInitTransition(`all ${duration || 1}s ${transitionTimingFunc || 'linear'} 0s`);
  }, [transitionTimingFunc, duration]);
  const handleToNext = () => {
    if (listRef.current !== null) {
      const childNodeIndex =
        direction === 'to-bottom' || direction === 'to-right' ? children.length - 1 - (index % children.length) : index;
      const childNode = listRef.current.childNodes[childNodeIndex] as Element;
      if (childNode.nodeType === 1) {
        const nowLen =
          moveLen + parseFloat(getComputedStyle(childNode)[swiperDirection === 'row' ? 'width' : 'height']);
        listRef.current.style.transform = `translate(${moveDirection === 'left' ? '-' : ''}${
          moveDirection === 'left' || moveDirection === 'right' ? `${nowLen}px` : '-50%'
        }, ${moveDirection === 'top' ? '-' : ''}${
          moveDirection === 'top' || moveDirection === 'bottom' ? `${nowLen}px` : '-50%'
        })`;
        setMoveLen(nowLen);
        if (isInfinity) {
          let newChildNode;
          if (direction === 'to-bottom' || direction === 'to-right') {
            newChildNode = listRef.current.childNodes[children.length - 1].cloneNode(true);
            listRef.current.insertBefore(newChildNode, listRef.current.firstElementChild as Node);
            // listRef.current.appendChild(newChildNode);
          } else {
            newChildNode = childNode.cloneNode(true);
            listRef.current.appendChild(newChildNode);
          }
        }
      }
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (hoverToStop) {
      setInitInterval(null);
    }
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (hoverToStop) {
      setInitInterval(interval + duration * 1000);
    }
  }, []);
  useInterval(() => {
    handleToNext();
    setIndex(index + 1);
  }, initInterval);
  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        height: outerRange.height,
        width: outerRange.width + extendWidth,
      }}
      className={outerClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={listRef}
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: swiperDirection,
          transition: initTransition,
          bottom: direction === 'to-bottom' ? 0 : '',
          left: direction === 'to-left' ? 0 : direction === 'to-bottom' || direction === 'to-top' ? '50%' : '',
          right: direction === 'to-right' || direction === 'to-left' ? 0 : '',
          top: direction === 'to-top' ? 0 : direction === 'to-right' || direction === 'to-left' ? '50%' : '',
          transform: `translate(${moveDirection === 'left' || moveDirection === 'right' ? 0 : '-50%'}, ${
            moveDirection === 'top' || moveDirection === 'bottom' ? 0 : '-50%'
          })`,
        }}
      >
        {initChildren}
      </div>
    </div>
  );
};

export default Swiper;
