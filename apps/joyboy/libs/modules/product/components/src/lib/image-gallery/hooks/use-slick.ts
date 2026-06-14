import { useBreakpoints } from '@castlery/fortress';
import { BundleOption, Image, Variant } from '@castlery/modules-product-domain';
import { useCallback, useMemo, useRef, useState } from 'react';

const useSlick = (
  images: Image[],
  product: Variant,
  customPagingFactory: (
    images: Image[],
    product: Variant,
    setCurrentIndex: (index: number) => void,
    dimensionGrayImage?: string,
    bundleOptions?: BundleOption[]
  ) => (i: number) => JSX.Element,
  status: boolean,
  dimensionGrayImage: string,
  bundleOption?: BundleOption[]
) => {
  const dragging = useRef(false);
  const slickRef = useRef();
  const galleryRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { desktop } = useBreakpoints();

  const handleSlickBeforeChange = useCallback((oldIndex: number, newIndex: number) => {
    if (oldIndex !== newIndex) {
      dragging.current = true;
    }
  }, []);

  const handleSlickAfterChange = useCallback((newIndex: number) => {
    dragging.current = false;
    setCurrentIndex(Math.floor(newIndex));
  }, []);

  const customPaging = useMemo(
    () => customPagingFactory(images, product, setCurrentIndex, dimensionGrayImage, bundleOption),
    [images, product, customPagingFactory, dimensionGrayImage, bundleOption]
  );

  const settings = useMemo(() => {
    return {
      dots: true,
      infinite: true,
      ref: slickRef,
      speed: 500,
      autoplay: false,
      swipeToSlide: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: desktop && !!(images && images.length > 1),
      customPaging,
      beforeChange: handleSlickBeforeChange,
      afterChange: handleSlickAfterChange,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPaging, handleSlickAfterChange, handleSlickBeforeChange, images, status, desktop]);

  const handleOnPictureClick = (cb: () => void) => {
    if (!dragging.current) {
      cb();
    }
  };

  return {
    settings,
    handleOnPictureClick,
    galleryRef,
    dragging,
    slickRef,
    currentIndex,
  };
};

export default useSlick;
