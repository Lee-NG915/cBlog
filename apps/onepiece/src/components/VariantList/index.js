import React, { useEffect, useRef } from 'react';
import { getBreakpoint } from 'utils/breakpoints';
import ResponsiveSlick from 'components/ResponsiveSlick';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';
import Variant from './Variant';

const VariantList = ({ variants = [], listName, className, containerSize = 'small' }) => {
  const { desktop } = useBreakpoints();

  const slickRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 1 });

  if (variants.length > 0) {
    return (
      <div ref={ref}>
        <div ref={slickRef}>
          <ResponsiveSlick
            className={classNames(className, style.list)}
            mediaQueries={
              containerSize === 'small'
                ? !desktop
                  ? [
                      {
                        query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                        numPerPage: 2,
                      },
                      {
                        query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                        numPerPage: 4,
                      },
                    ]
                  : [
                      {
                        query: `(max-width: ${getBreakpoint('lg', 'max')}px)`,
                        numPerPage: 3,
                      },
                      {
                        query: `(min-width: ${getBreakpoint('xl', 'min')}px)`,
                        numPerPage: 4,
                      },
                    ]
                : !desktop
                ? [
                    {
                      query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 2,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px) and (max-width: ${getBreakpoint(
                        'lg',
                        'max'
                      )}px)`,
                      numPerPage: 4,
                    },
                  ]
                : [
                    {
                      query: `(min-width: ${getBreakpoint('xs', 'min')}px)`,
                      numPerPage: 4,
                    },
                  ]
            }
          >
            {variants.map((variant, index) => (
              <Variant
                key={index}
                listName={listName}
                listPosition={index + 1}
                variant={variant}
                rootRef={slickRef}
                isRootShown={inView}
              />
            ))}
          </ResponsiveSlick>
        </div>
      </div>
    );
  }
  return null;
};

export default VariantList;
