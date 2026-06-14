import { RefinedProductGalleryError } from './error';
import { RefinedProductGalleryClient } from './refined-product-gallery.client';

interface RefinedProductGalleryProps {
  promise: Promise<any>;
}

export const RefinedProductGallery = async (props: RefinedProductGalleryProps) => {
  const { promise } = props;
  try {
    await promise;
    return <RefinedProductGalleryClient />;
  } catch (error: any) {
    return <RefinedProductGalleryError error={error} />;
  }
};
