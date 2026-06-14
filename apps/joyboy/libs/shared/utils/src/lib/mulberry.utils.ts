import type {
  LineItem,
  LineItem_V2,
  MulberryPayload,
  WarrantyOffer,
  BundleLineItem,
  Image,
  ProductTaxon,
} from '@castlery/types';

/**
 * mulberry https://docs.getmulberry.com/reference/apiwarranty-offers
 * @param item
 * @returns
 */
export const formatWarrantyOfferPayload_V2 = (item: LineItem_V2) => {
  const variant = item.variant;
  const { listPrice, name, sku, images } = variant;
  let title = name;
  let id = sku;
  let price = Number(listPrice);
  const imgs = images?.map((image) => ({
    src: image.links.medium,
  }));
  if (item.productType === 'bundle') {
    title = item.bundleLineItems?.reduce((acc, cur) => `${acc}, ${cur.variant.name}`, name) || '';
    price = item.bundleLineItems?.reduce((acc, cur) => acc + cur.quantity * Number(cur.variant.listPrice), 0) || 0;
    // "TPB-000373?bundle_option[279]=20482&bundle_option[280]=20785"
    // bundleLineItems[n].bundleOption.id = 279
    // bundleLineItems[n].variant.id = 20482
    id = `${item.bundleLineItems?.reduce(
      (pre, cur, index) =>
        `${pre}${index === 0 ? '' : '&'}bundle_option[${cur && cur.bundleOption && cur.bundleOption.id}]=${
          cur && cur.variant && cur.variant.id
        }`,
      `${sku}?`
    )}`;
  }
  return {
    title, //"{{product.title}}" required,
    id, //"{{product.sku}}" required,
    price: price, //"{{product.price.without_tax.value}}"  required
    images: imgs,
    meta: {},
  };
};

export const formatWarrantyOfferPayload = ({
  variant,
  product_type,
  bundle_line_items,
}: {
  variant: LineItem['variant'];
  product_type: string;
  bundle_line_items: LineItem['bundle_line_items'];
}) => {
  const { list_price, name, sku, images, product_taxons } = variant;
  let price = Number(list_price);
  let title = name;
  let id = sku;
  if (product_type === 'bundle') {
    title = bundle_line_items?.reduce((acc: string, cur: BundleLineItem) => `${acc}, ${cur.variant.name}`, name) || '';
    price =
      bundle_line_items?.reduce(
        (acc: number, cur: BundleLineItem) => acc + cur.quantity * Number(cur.variant.list_price),
        0
      ) || 0;
    id = `${bundle_line_items?.reduce(
      (pre: string, cur: BundleLineItem, index: number) =>
        `${pre}${index === 0 ? '' : '&'}bundle_option[${cur && cur.bundle_option && cur.bundle_option.id}]=${
          cur && cur.variant && cur.variant.id
        }`,
      `${sku}?`
    )}`;
  }
  return {
    title,
    id,
    price,
    images: images?.map((image: Image) => ({
      src: image.links.medium,
    })),
    meta: {
      breadcrumbs: product_taxons
        ?.filter((taxon: ProductTaxon) => taxon.name !== 'Category' && !taxon.name.includes('Collection'))
        .map((taxon: ProductTaxon) => ({
          category: taxon.name,
        })),
    },
  };
};

export interface initMulberryPayload {
  payload: MulberryPayload;
  onSelect: (warranty: WarrantyOffer) => Promise<void>;
  onSuccess: (modal: any) => void;
}
export const initMulberry = async ({ payload, onSelect, onSuccess }: initMulberryPayload) => {
  if (!window || !window?.mulberry?.core || !window?.mulberry?.modal) return;
  const offers = await window?.mulberry?.core?.getWarrantyOffer(payload);
  console.log('-init successed-offers--', offers);
  if (!offers || !window.mulberry.core.settings) return;
  window.mulberry.modal
    .init({
      offers: offers,
      settings: window.mulberry.core.settings,
      onWarrantySelect: async (warranty: WarrantyOffer) => {
        await onSelect(warranty);
      },
    })
    .then((modal: any) => {
      onSuccess(modal);
    });
};
