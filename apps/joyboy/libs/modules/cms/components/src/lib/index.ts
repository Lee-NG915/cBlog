import { FC } from 'react';
import { BaseStack } from './atoms/base-stack/base-stack';
import { CategoryNavigation } from './category-navigation/category-navigation';
import CmsBlogBanner from './cms-blog-banner/cms-blog-banner';
import CmsBrandIntroduction from './cms-brand-introduction/cms-brand-introduction';
import { CmsBreadcrumbs } from './cms-breadcrumbs/cms-breadcrumbs';
import { CmsButton } from './cms-button/cms-button';
import { CmsCarousel } from './cms-carousel/cms-carousel';
import { CmsLink } from './cms-link/cms-link';
import { CmsProductOption } from './cms-product-option/cms-product-option';
import { CmsPromotionBanner } from './cms-promotion-banner/cms-promotion-banner';
import { CmsText } from './cms-text/cms-text';
import { CmsYotpoBanner } from './cms-yotpo-banner/cms-yotpo-banner';
import { BlogBanner } from './component-v1/banner/blog-banner';
import { FullWidthBanner } from './component-v1/banner/full-width-banner';
import { ImageTextBanner } from './component-v1/banner/image-text-banner';
import { LinkBanner } from './component-v1/banner/link-banner';
import { TextImageBanner } from './component-v1/banner/text-image-banner';
import { TieredBanner } from './component-v1/banner/tiered-banner';
import { BlogTable } from './component-v1/blog-table';
import { Button } from './component-v1/button';
import { DYEmbed } from './component-v1/dy';
import { EmplifiProductSocialWidget } from './component-v1/emplifi-product-social-widget';
import { Image } from './component-v1/image';
import { JsTool } from './component-v1/js-tool';
import { DetailedListing } from './component-v1/listing/detailed-listing';
import { DetailedProductListing } from './component-v1/listing/detailed-product-listing';
import { SimpleListing } from './component-v1/listing/simple-listing';
import { SimpleProductListing } from './component-v1/listing/simple-product-listing';
import { TextListing } from './component-v1/listing/text-listing';
import { MixMatch, MixMatchLink, MixMatchNoLink, SmallMixMatch } from './component-v1/mix-match';
import { PageAnchor } from './component-v1/page-anchor';
import { Review } from './component-v1/review/review';
import { ReviewsCarousel } from './component-v1/review/reviews-carousel';
import { RowItem } from './component-v1/row/row-item';
import { RowListing } from './component-v1/row/row-listing';
import { SectionBreak } from './component-v1/section-break';
import { StandaloneFeature } from './component-v1/standalone-feature/standalone-feature';
import { Table } from './component-v1/table/table';
import { Text } from './component-v1/text/text';
import { TieredItem } from './component-v1/tiered-sale-banner/components/tiered-item';
import { TieredSaleBanner } from './component-v1/tiered-sale-banner/tiered-sale-banner';
import { HoverCarousel } from './component-v1/ugc/hover-carousel';
import { HoverListing } from './component-v1/ugc/hover-listing';
import { UGCCarousel } from './component-v1/ugc/ugc-carousel';
import { UGCListing } from './component-v1/ugc/ugc-listing';
import { Video } from './component-v1/video';
import { DyRecommendationWidget } from './dy-recommendation-widget/dy-recommendation-widget';
import { LinkBanner as LinkBannerV2 } from './link-banner';
import { MenuVariant } from './menu-variant/menu-variant';
import { CmsPlaProductInfo } from './pla/cms-pla-product-info';
import { CmsPlaStickyBar } from './pla/cms-pla-sticky-bar';
import { ProductBestsellers } from './product-bestsellers/product-bestsellers';
import { ProductsCollection } from './products-collection/products-collection';
import { Reviews } from './reviews/reviews';
import { ServiceGuarantee, ServiceGuaranteeShort } from './service-guarantee';
import { ShopTheLook } from './shop-the-look/shop-the-look';
import { StickyButtonBar } from './sticky-bar';
import {
  RefinedUspVariantAServer,
  RefinedUspVariantBServer,
  RefinedUspVariantCServer,
  RefinedUspVariantDServer,
} from './usp';
import { Accordion, AccordionItem, AccordionOutdated } from './accordion';
import { Anchor } from './anchor/anchor';
import { ShopTheLookItem } from './component-v1/shop-the-look-item';
import { ShopTheLookList } from './component-v1/shop-the-look-list';
import { HalfBanner } from './half-banner';
import { Hero } from './hero';
import { HoverHorizontalCard, HoverVerticalCard } from './hover-card';
import { HoverListing as HoverListingV2 } from './hover-listing';
import { ImageCarousel } from './image-carousel';
import { KlaviyoInputForm } from './klaviyo_input_form';
import { MixMatchV2 } from './mix-match';
import { MixMatchCard } from './mix-match-card';
import { NewTieredSaleBanner } from './new-tiered-sale-banner';
import { OneThirdBanner } from './one-third-banner';
import { ProductCard } from './product-card';
import { ProductListingBanner } from './product-listing-banner';
import { RecommendationCarousel } from './recommendation-carousel/recommendation-carousel';
import { ReviewBanner } from './review-banner';
import { SocialUGC } from './social-ugc/social-ugc';
import { StandaloneBanner } from './standalone-banner';
import { Tables } from './tables';
import { TextBanner } from './text-banner';
import { YotpoTemplate } from './yotpo-template';
import { SimpleForm } from './simple-form/simple-form';
import { RoomDesigner, FurnitureConfiguratorTool } from './room-designer';
import { OptionalBlockList } from './optional-block-list';
import TheLook from './shop-the-look/components/theLook';

type ComponentsMapType = {
  [key: string]: FC<any>;
};

const componentKeyMap = {
  menuVariant: 'menu_variant',
  // // ----------------- PLA refactor -----------------
  productOptionsV2: 'product_options_v2',
  productInfoV2: 'product_info_v2',
  productBannerV2: 'product_banner_v2',
  yotpoBannerWidgetV2: 'yotpo_banner_widget_v2',
  stickyBarV2: 'sticky_bar_v2',
  stickyButtonBarV2: 'sticky_button_bar_v2',
  reviewsV2: 'reviews_v2',
  productsCollectionV2: 'products_collection_v2',
  uspVariantAV2: 'usp_variant_a_v2',
  bestsellersDefaultVariantV2: 'bestsellers_default_variant_v2',
  blogBannerV2: 'blog_v2',
  plaUspTemplateV2: 'pla_usp_template_v2',
  shopTheLookV2: 'shop_the_look_v2',
  dyRecommendationWidgetV2: 'dy_recommendation_widget_v2',
  serviceGuaranteeVariantAV2: 'service_guarantee_variant_a_v2',
  serviceGuaranteeVariantBV2: 'service_guarantee_variant_b_v2',
  categoryNavigationV2: 'category_navigation_v2',
  brandIntroductionV2: 'brand_introduction_v2',
  promotionBannerV2: 'promotion_banner_v2',
  breadcrumbs: 'breadcrumbs_v2',
  // ----------------- PLA refactor -----------------
  //----------------- common ------------------
  linkBlokV2: 'link_blok_v2',
  textBlokV2: 'text_blok_v2',
  buttonV2: 'button_v2',
  anchorBlokV2: 'anchor_blok_v2',
  //----------- onepiece components ------------
  blogBanner: 'blog-banner',
  button: 'button',
  image: 'image',
  video: 'video',
  text: 'text',
  linkBanner: 'link-banner',
  linkBannerV2: 'Link Banner',
  mixMatch: 'mix-match',
  mixMatchLink: 'mix-match-link',
  mixMatchNoLink: 'mix-match-no-link',
  smallMixMatch: 'small-mix-match',
  sectionBreak: 'section-break',
  dyEmbed: 'dynamic-yield-embed',
  emplifiProductSocialWidget: 'emplifi-product-social-widget',
  jsTool: 'js-tool',
  textListing: 'text-listing',
  simpleListing: 'simple-listing',
  simpleProductListing: 'simple-product-listing',
  detailedListing: 'detailed-listing',
  detailedProductListing: 'detailed-product-listing',
  pageAnchor: 'page-anchor',
  review: 'review',
  reviewsCarousel: 'reviews-carousel',
  rowItem: 'row-item',
  rowListing: 'row-listing',
  standaloneFeature: 'standalone-feature',
  table: 'table',
  tieredItem: 'tiered-item',
  tieredSaleBanner: 'tiered-sale-banner',
  ugcCarousel: 'ugc-carousel',
  ugcListing: 'ugc-listing',
  hoverCarousel: 'hover-carousel',
  hoverListing: 'hover-listing',
  fullWidthBanner: 'full-width-banner',
  imageTextBanner: 'image-text-banner',
  textImageBanner: 'text-image-banner',
  blogTable: 'blog-table',
  tieredBanner: 'tiered-banner',
  baseStack: 'Base Stack',
  RefinedUspVariantA: 'usp_variant_a',
  RefinedUspVariantB: 'usp_variant_b',
  RefinedUspVariantC: 'usp_variant_c',
  RefinedUspVariantD: 'usp_variant_d',
  shopTheLookItem: 'Shop The Look Item',
  shopTheLookList: 'Shop The Look List',
  mixMatchCard: 'Mix Match Card V2',
  mixMatchV2: 'Mix Match V2',
  hoverHorizontalCard: 'Hover Horizontal Card',
  hoverVerticalCard: 'Hover Vertical Card',
  hoverListingV2: 'Hover Listing V2',
  socialUGC: 'Social UGC',
  textBanner: 'Text Banner',
  klaviyoSignupForm: 'klaviyo_signup_form',
  standaloneBanner: 'Standalone Banner',
  halfBanner: 'Half Banner',
  oneThirdBanner: 'One Third Banner',
  reviewBanner: 'Review Banner',
  recommendationCarousel: 'Recommendation Carousel',
  imageCarousel: 'Image Carousel',
  anchor: 'Anchor',
  productCard: 'Product Card',
  productListingBanner: 'Product Listing Banner',
  tables: 'Tables',
  newTieredSaleBanner: 'New Tiered Sale Banner',
  accordionItem: 'Accordion Item',
  accordion: 'Accordion',
  hero: 'Hero',
  yotpoTemplate: 'yotpo-template',
  simpleForm: 'Simple Form',
  roomDesigner: 'room-designer',
  furnitureConfiguratorTool: 'furniture-configurator-tool',
  optionalBlockList: 'Optional Block List',
  accordionOutdated: 'accordion',
};

const components: ComponentsMapType = {
  [componentKeyMap.menuVariant]: MenuVariant,
  // // ----------------- PLA refactor -----------------
  [componentKeyMap.productOptionsV2]: CmsProductOption,
  [componentKeyMap.productInfoV2]: CmsPlaProductInfo,
  [componentKeyMap.productBannerV2]: CmsCarousel,
  [componentKeyMap.yotpoBannerWidgetV2]: CmsYotpoBanner,
  [componentKeyMap.stickyBarV2]: CmsPlaStickyBar,
  [componentKeyMap.stickyButtonBarV2]: StickyButtonBar,
  [componentKeyMap.reviewsV2]: Reviews,
  [componentKeyMap.productsCollectionV2]: ProductsCollection,
  [componentKeyMap.bestsellersDefaultVariantV2]: ProductBestsellers,
  [componentKeyMap.blogBannerV2]: CmsBlogBanner,
  [componentKeyMap.shopTheLookV2]: ShopTheLook,
  [componentKeyMap.dyRecommendationWidgetV2]: DyRecommendationWidget,
  [componentKeyMap.serviceGuaranteeVariantAV2]: ServiceGuaranteeShort,
  [componentKeyMap.serviceGuaranteeVariantBV2]: ServiceGuarantee,
  [componentKeyMap.categoryNavigationV2]: CategoryNavigation,
  [componentKeyMap.brandIntroductionV2]: CmsBrandIntroduction,
  [componentKeyMap.promotionBannerV2]: CmsPromotionBanner,
  [componentKeyMap.breadcrumbs]: CmsBreadcrumbs,
  // ----------------- PLA refactor -----------------
  //----------------- common ------------------
  [componentKeyMap.linkBlokV2]: CmsLink,
  [componentKeyMap.textBlokV2]: CmsText,
  [componentKeyMap.buttonV2]: CmsButton,
  [componentKeyMap.baseStack]: BaseStack,
  [componentKeyMap.RefinedUspVariantA]: RefinedUspVariantAServer,
  [componentKeyMap.RefinedUspVariantB]: RefinedUspVariantBServer,
  [componentKeyMap.RefinedUspVariantC]: RefinedUspVariantCServer,
  [componentKeyMap.RefinedUspVariantD]: RefinedUspVariantDServer,
  //----------- onepiece components ------------
  [componentKeyMap.blogBanner]: BlogBanner,
  [componentKeyMap.button]: Button,
  [componentKeyMap.image]: Image,
  [componentKeyMap.video]: Video,
  [componentKeyMap.text]: Text,
  [componentKeyMap.linkBanner]: LinkBanner,
  [componentKeyMap.linkBannerV2]: LinkBannerV2,
  [componentKeyMap.mixMatch]: MixMatch,
  [componentKeyMap.mixMatchLink]: MixMatchLink,
  [componentKeyMap.mixMatchNoLink]: MixMatchNoLink,
  [componentKeyMap.smallMixMatch]: SmallMixMatch,
  [componentKeyMap.sectionBreak]: SectionBreak,
  [componentKeyMap.dyEmbed]: DYEmbed,
  [componentKeyMap.emplifiProductSocialWidget]: EmplifiProductSocialWidget,
  [componentKeyMap.jsTool]: JsTool,
  [componentKeyMap.textListing]: TextListing,
  [componentKeyMap.simpleListing]: SimpleListing,
  [componentKeyMap.simpleProductListing]: SimpleProductListing,
  [componentKeyMap.detailedListing]: DetailedListing,
  [componentKeyMap.detailedProductListing]: DetailedProductListing,
  [componentKeyMap.pageAnchor]: PageAnchor,
  [componentKeyMap.review]: Review,
  [componentKeyMap.reviewsCarousel]: ReviewsCarousel,
  [componentKeyMap.rowItem]: RowItem,
  [componentKeyMap.rowListing]: RowListing,
  [componentKeyMap.standaloneFeature]: StandaloneFeature,
  [componentKeyMap.table]: Table,
  [componentKeyMap.tieredItem]: TieredItem,
  [componentKeyMap.tieredSaleBanner]: TieredSaleBanner,
  [componentKeyMap.ugcCarousel]: UGCCarousel,
  [componentKeyMap.ugcListing]: UGCListing,
  [componentKeyMap.hoverCarousel]: HoverCarousel,
  [componentKeyMap.hoverListing]: HoverListing,
  [componentKeyMap.fullWidthBanner]: FullWidthBanner,
  [componentKeyMap.imageTextBanner]: ImageTextBanner,
  [componentKeyMap.textImageBanner]: TextImageBanner,
  [componentKeyMap.blogTable]: BlogTable,
  [componentKeyMap.tieredBanner]: TieredBanner,
  [componentKeyMap.shopTheLookItem]: ShopTheLookItem,
  [componentKeyMap.shopTheLookList]: ShopTheLookList,
  [componentKeyMap.mixMatchCard]: MixMatchCard,
  [componentKeyMap.mixMatchV2]: MixMatchV2,
  [componentKeyMap.hoverHorizontalCard]: HoverHorizontalCard,
  [componentKeyMap.hoverVerticalCard]: HoverVerticalCard,
  [componentKeyMap.hoverListingV2]: HoverListingV2,
  [componentKeyMap.socialUGC]: SocialUGC,
  [componentKeyMap.textBanner]: TextBanner,
  [componentKeyMap.klaviyoSignupForm]: KlaviyoInputForm,
  [componentKeyMap.standaloneBanner]: StandaloneBanner,
  [componentKeyMap.halfBanner]: HalfBanner,
  [componentKeyMap.oneThirdBanner]: OneThirdBanner,
  [componentKeyMap.reviewBanner]: ReviewBanner,
  [componentKeyMap.recommendationCarousel]: RecommendationCarousel,
  [componentKeyMap.imageCarousel]: ImageCarousel,
  [componentKeyMap.anchor]: Anchor,
  [componentKeyMap.productCard]: ProductCard,
  [componentKeyMap.productListingBanner]: ProductListingBanner,
  [componentKeyMap.tables]: Tables,
  [componentKeyMap.newTieredSaleBanner]: NewTieredSaleBanner,
  [componentKeyMap.accordionItem]: AccordionItem,
  [componentKeyMap.accordion]: Accordion,
  [componentKeyMap.hero]: Hero,
  [componentKeyMap.yotpoTemplate]: YotpoTemplate,
  [componentKeyMap.simpleForm]: SimpleForm,
  [componentKeyMap.roomDesigner]: RoomDesigner,
  [componentKeyMap.furnitureConfiguratorTool]: FurnitureConfiguratorTool,
  [componentKeyMap.optionalBlockList]: OptionalBlockList,
  [componentKeyMap.accordionOutdated]: AccordionOutdated,
};

export {
  componentKeyMap,
  components,
  MenuVariant,
  FullWidthBanner,
  NewTieredSaleBanner,
  LinkBannerV2,
  RecommendationCarousel,
  HalfBanner,
  SocialUGC,
  Accordion,
  TheLook,
};

export * from './product-faq-list';
