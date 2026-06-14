// import useInfiniteScroll from 'react-easy-infinite-scroll-hook';
import PropTypes from 'prop-types';
import { VariantInfo } from 'components/VariantCollection/VariantInfo';
import { useBreakpoints } from '@castlery/fortress';
import { useRef, useCallback, useEffect, useMemo } from 'react';

export const InfiniteListComponent = (props) => {
  const { items, canLoadMore, next, title } = props;
  const { desktop } = useBreakpoints();
  const observer = useRef(null);
  const lastItemRef = useRef(null);
  const containerRef = useRef(null);
  const prevLengthRef = useRef(null);
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && canLoadMore) {
        next('right');
        prevLengthRef.current = items?.length;
      }
    },
    [canLoadMore, items?.length, next]
  );

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    if (prevLengthRef?.current !== items?.length) {
      observer.current = new IntersectionObserver(handleObserver, {
        root: containerRef.current,
        rootMargin: '0px 200px 0px 0px',
        threshold: 1.0,
      });

      if (lastItemRef.current) {
        observer.current.observe(lastItemRef.current);
      }
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [handleObserver, items]);

  const variantRenderList = useMemo(
    () =>
      items.map((variant, index) => (
        <VariantInfo
          variant={variant}
          lazy
          link
          listName={title}
          listPosition={index + 1}
          key={index}
          productSlug={variant?.product_slug}
          customRef={index === items.length - 1 ? lastItemRef : null}
          style={{
            ...(!desktop && {
              width: `40%`,
              flexShrink: 0,
            }),
          }}
        />
      )),
    [desktop, items, title]
  );

  return (
    <div
      ref={containerRef}
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: '20px',
      }}
    >
      {/* {isLoading ? loader : variantRenderList} */}
      {variantRenderList}
    </div>
  );
};
InfiniteListComponent.propTypes = {
  items: PropTypes.array,
  canLoadMore: PropTypes.bool,
  next: PropTypes.func,
  title: PropTypes.string,
};
