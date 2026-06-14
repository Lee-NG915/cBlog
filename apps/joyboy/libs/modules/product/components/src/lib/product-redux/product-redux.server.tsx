import { notFound, permanentRedirect, RedirectType } from 'next/navigation';
import { ProductReduxClient } from './product-redux.client';
import { EcEnv } from '@castlery/config';
// import { notFound } from 'next/navigation';
interface ProductReduxServerProps {
  promise: Promise<any>;
  slug: string;
}

export async function ProductReduxServer(props: ProductReduxServerProps) {
  const { promise, slug } = props;
  try {
    const productData = await promise;
    if (productData?.slug !== slug) {
      permanentRedirect(
        `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/products/${productData?.slug}`,
        RedirectType.replace
      );
    }
    return <ProductReduxClient productData={productData} />;
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    notFound();
  }
}

export default ProductReduxServer;
