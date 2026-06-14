import { storyblokInit, apiPlugin } from '@storyblok/react';
import { FullWidthBanner, ImageTextBanner, TextImageBanner, TieredBanner, LinkBanner } from 'storyblok/banner';
import { MixMatchLink, MixMatchNoLink, SmallMixMatch, MixMatch } from 'storyblok/mix-match';
import { UGCListing, HoverListing, UGCCarousel, HoverCarousel } from 'storyblok/ugc';
import {
  SimpleProductListing,
  TextListing,
  SimpleListing,
  DetailedProductListing,
  DetailedListing,
} from 'storyblok/listing';
import { Review, ReviewsCarousel } from 'storyblok/review';
import { Page } from 'storyblok/page';
import { Button } from 'storyblok/button';
import { Image } from 'storyblok/image';
import { Video } from 'storyblok/video';
import { SectionBreak } from 'storyblok/section-break';
import { RowItem, RowListing } from 'storyblok/row';
import { DYEmbed } from 'storyblok/dy';
import { StandaloneFeature } from 'storyblok/standalone-feature';
import { PageAnchor } from 'storyblok/page-anchor';
import { Text } from 'storyblok/text';
import { Accordion } from 'storyblok/accordion';
import { Table } from 'storyblok/table';
import PageGroup from 'storyblok/page-group/page-group';
import { TieredItem, TieredSaleBanner } from 'storyblok/tiered-sale-banner';
import { BlogPage } from 'storyblok/blog-page';
import { BlogBanner } from 'storyblok/banner/blog-banner';
import { BlogTable } from 'storyblok/blog-table';
import { EmplifiProductSocialWidget } from 'storyblok/emplifi-product-social-widget';
import { JsTool } from 'storyblok/js-tool';
import { RoomDesigner } from 'storyblok/room-designer';
import { FurnitureConfiguratorTool } from 'storyblok/furniture-configurator-tool';
import { DYCustomCodeTemplate } from 'storyblok/dy-custom-code-template';
import { YotpoTemplate } from 'storyblok/yotpo-template';
import { KlaviyoInputForm } from 'storyblok/klaviyo-input-form';

const components = {
  page: Page,
  button: Button,
  image: Image,
  video: Video,
  'full-width-banner': FullWidthBanner,
  'image-text-banner': ImageTextBanner,
  'text-image-banner': TextImageBanner,
  'tiered-banner': TieredBanner,
  'link-banner': LinkBanner,
  'mix-match-link': MixMatchLink,
  'mix-match-no-link': MixMatchNoLink,
  'small-mix-match': SmallMixMatch,
  'mix-match': MixMatch,
  'section-break': SectionBreak,
  'row-item': RowItem,
  'row-listing': RowListing,
  'dynamic-yield-embed': DYEmbed,
  'ugc-listing': UGCListing,
  'hover-listing': HoverListing,
  'ugc-carousel': UGCCarousel,
  'hover-carousel': HoverCarousel,
  'standalone-feature': StandaloneFeature,
  'simple-product-listing': SimpleProductListing,
  'text-listing': TextListing,
  'simple-listing': SimpleListing,
  'detailed-product-listing': DetailedProductListing,
  'detailed-listing': DetailedListing,
  review: Review,
  'reviews-carousel': ReviewsCarousel,
  'page-anchor': PageAnchor,
  text: Text,
  accordion: Accordion,
  table: Table,
  'page-group': PageGroup,
  'tiered-item': TieredItem,
  'tiered-sale-banner': TieredSaleBanner,
  'Blog Page': BlogPage,
  'blog-banner': BlogBanner,
  'blog-table': BlogTable,
  'emplifi-product-social-widget': EmplifiProductSocialWidget,
  'js-tool': JsTool,
  'room-designer': RoomDesigner,
  'furniture-configurator-tool': FurnitureConfiguratorTool,
  'dy-api-custom-code-banner': DYCustomCodeTemplate,
  klaviyo_signup_form: KlaviyoInputForm,
  'yotpo-template': YotpoTemplate,
};

storyblokInit({
  accessToken: __STORYBLOK_ACCESS_TOKEN__,
  use: [apiPlugin],
  components,
});

export const startStoryblok = () => {
  storyblokInit({
    accessToken: __STORYBLOK_ACCESS_TOKEN__,
    use: [apiPlugin],
    components,
  });
};
