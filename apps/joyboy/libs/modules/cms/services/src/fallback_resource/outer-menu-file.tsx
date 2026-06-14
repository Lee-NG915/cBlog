/* eslint-disable */
/**
 * Outer Menu Fallback Data
 *
 * 这个文件由脚本自动生成，请勿手动编辑
 * 用于 getGlobalMenuGroupMenu 方法的 fallback 数据
 * 参考 apps/web/scripts/update-basic-container-resource-fallback.ts 的逻辑
 *
 * @generated
 * @lastUpdated 2025-12-10T10:03:13.648Z
 */

interface FallbackData {
  value: any[];
  lastUpdated: string;
  note: string;
}

/**
 * 各市场的 Outer Menu 兜底数据
 * 当 Storyblok API 不可用时使用这些数据
 *
 * Edge Runtime 兼容：数据在编译时打包进 bundle
 *
 * 数据结构对应 getGlobalMenuGroupMenu 方法的返回值
 */
export const FALLBACK_OUTER_MENU_DATA: Record<string, FallbackData> = {
  sg: {
    value: [
      {
        slug: 'sale',
        blocks: [
          {
            link: '/sale/holiday-storewide-sale',
            title: 'Holiday Sale: Upsized Savings​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764603108/marketing/SG/menu%20banner/011225_HolidaySale_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/holiday-sale-event',
            title: 'Holiday Sale Event',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764861295/marketing/SG/menu%20banner/041225_HolidaySaleEvent_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1736302845/marketing/AU/menu/25_Flexi_Living_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/dining-add-on-bundle',
            title: 'Dining Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1740981315/marketing/SG/menu%20banner/030325_Dining_AOB_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bedroom-add-on-bundle',
            title: 'Bedroom Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1735797334/marketing/SG/menu%20banner/020125_Beds_NewIn_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1675059300/marketing/SG/menu%20banner/Sale_30012023_2_BundlesOnSale.jpg',
            action_text: 'Buy More, Save More',
            permalink: '',
          },
          {
            link: '/sale/furniture-clearance',
            title: 'Clearance Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1662083632/marketing/Cross-Market/menu%20banner/Clearance_Sep22_3_Sale_ignore.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/new-homeowners',
            title: 'New Homeowners Special',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1638172611/marketing/SG/menu%20banner/Menu_Desktop_Homeowners.jpg',
            action_text: 'Enjoy More Savings',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-text',
        blocks: [
          {
            link: '/sale/holiday-storewide-sale',
            title: 'Holiday Sale: Upsized Savings​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764603110/marketing/SG/menu%20banner/011225_HolidaySale_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/holiday-sale-event',
            title: 'Holiday Sale Event',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764861333/marketing/SG/menu%20banner/041225_HolidaySaleEvent_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1736302845/marketing/AU/menu/25_Flexi_Living_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/dining-add-on-bundle',
            title: 'Dining Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1740981313/marketing/SG/menu%20banner/030325_Dining_AOB_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bedroom-add-on-bundle',
            title: 'Bedroom Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1735797334/marketing/SG/menu%20banner/020125_Beds_NewIn_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/furniture-clearance',
            title: 'Clearance',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651207462/marketing/SG/menu%20banner/20220428_Menu_Mobile_Clearance.jpg',
            action_text: 'Shop Now',
            permalink: 'special/final-markdowns',
          },
          {
            link: '/new-homeowners',
            title: 'New Homeowners Special',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1638262341/category_banner/SG_NewHomeownersSpecial_Mobile.jpg',
            action_text: '',
            permalink: 'sale',
          },
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1657619265/marketing/SG/menu%20banner/Menu_Mobile_RTS_Owen.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'new',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140618/marketing/SG/menu%20banner/261125_New_NewArrivals_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140622/marketing/SG/menu%20banner/261125_New_DFL_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/small-space-and-apartment-furniture',
            title: 'Castlery Compact',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140624/marketing/SG/menu%20banner/261125_New_CastleryCompact_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741839418/marketing/SG/menu%20banner/130325_S125_Brand_WCHT_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: 'https://www.castlery.com/sg/new?tags[0]=new&lead_time[0]=3_15',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741841233/marketing/SG/menu%20banner/130325_S125_New_RTS_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/customisation-service',
            title: 'Customisation Service​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722838356/marketing/US/Menu/08082024_Customisation_Launch_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Customisation Service​',
          },
        ],
        disable: false,
      },
      {
        slug: 'new-category',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140626/marketing/SG/menu%20banner/261125_New_NewArrivals_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140637/marketing/SG/menu%20banner/261125_New_DFL_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/small-space-and-apartment-furniture',
            title: 'Castlery Compact',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140644/marketing/SG/menu%20banner/261125_New_CastleryCompact_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741839418/marketing/SG/menu%20banner/130325_S125_Brand_WCHT_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: 'https://www.castlery.com/sg/new?tags[0]=new&lead_time[0]=3_15​',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741841231/marketing/SG/menu%20banner/130325_S125_New_RTS_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/customisation-service',
            title: 'Customisation Service​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722838356/marketing/US/Menu/08082024_Customisation_Launch_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Customisation Service​',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture',
        blocks: [
          {
            link: '/virtual-studio',
            title: 'Virtual Studio',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1638172309/marketing/SG/menu%20banner/Menu_Desktop_VirtualStudio.jpg',
            action_text: 'Learn More',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-category',
        blocks: [
          {
            link: '/sofas/sale',
            title: 'Sofa ',
            image_url: '',
            action_text: '',
            permalink: 'living-room',
          },
          {
            link: '/tables/sale',
            title: 'Tables',
            image_url: '',
            action_text: '',
            permalink: 'Tables',
          },
          {
            link: '/chairs/sale',
            title: 'Chairs',
            image_url: '',
            action_text: '',
            permalink: 'Chairs',
          },
          {
            link: '/beds/sale',
            title: 'Beds',
            image_url: '',
            action_text: '',
            permalink: 'bedroom',
          },
          {
            link: '/storage/sale',
            title: 'Storage',
            image_url: '',
            action_text: '',
            permalink: 'storage',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1611197616/marketing/Cross-Market/menu%20banner/Menu_Desktop_VincentBundle.jpg',
            action_text: 'Buy More, Save More',
            permalink: '',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1633671795/marketing/Cross-Market/menu%20banner/Menu_OutdoorSale_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
        ],
        disable: false,
      },
      {
        slug: 'sofas',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141469/marketing/SG/menu%20banner/261125_Sofa_NewIn.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/sofas/sectional-sofas',
            title: 'Sectional Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141471/marketing/SG/menu%20banner/261125_Sofa_SectionalSofas.jpg',
            action_text: 'Shop Now',
            permalink: 'Sectional Sofas',
          },
          {
            link: '/sofas/all-sofas?fabric_feature[0]=Spill-resistant%20&fabric_feature[1]=Stain-resistant%20%26%20Pet-friendly',
            title: 'Spill & Stain Resistant Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141472/marketing/SG/menu%20banner/261125_Sofa_SpillStainResistant.jpg',
            action_text: 'Shop Now',
            permalink: 'Spill & Stain Resistant Sofas',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710898658/marketing/SG/menu%20banner/Sofas_Best_20032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
          {
            link: '/collections/elias-collection',
            title: 'Elias Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1675058601/marketing/SG/menu%20banner/Sofa_30012023_2_Elias-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Elias Collection',
          },
        ],
        disable: false,
      },
      {
        slug: 'tables',
        blocks: [
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141783/marketing/SG/menu%20banner/261125_Tables_NewIn.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables New In',
          },
          {
            link: '/tables/dining-tables?lead_time[0]=3_15',
            title: 'Ready To Ship Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1761063598/marketing/SG/menu%20banner/Oct2025_Holiday_Comms_RTSDining_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Tables',
          },
          {
            link: '/tables/coffee-tables',
            title: 'Coffee Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1761065294/marketing/SG/menu%20banner/Oct2025_Holiday_Comms_CoffeeTables_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Coffee Tables',
          },
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1699937656/marketing/SG/menu%20banner/14112023_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables New In',
          },
        ],
        disable: false,
      },
      {
        slug: 'chairs',
        blocks: [
          {
            link: '/chairs/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139951/marketing/SG/menu%20banner/261125_Chairs_NewIn.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/chairs/armchairs?lead_time[0]=3_15',
            title: 'Ready To Ship Armchairs​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139952/marketing/SG/menu%20banner/261125_Chairs_RTSArmchairs.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Armchairs​',
          },
          {
            link: '/chairs/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139954/marketing/SG/menu%20banner/261125_Chairs_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/chairs/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716459971/marketing/SG/menu%20banner/chairs_sale_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/chairs/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698200323/marketing/SG/menu%20banner/Chairs_25102023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
        ],
        disable: false,
      },
      {
        slug: 'beds',
        blocks: [
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756961301/marketing/SG/menu%20banner/S325_Beds_NewIn_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/beds/all-bedroom?lead_time[1]=0_3&lead_time[2]=3_15',
            title: 'Ready To Ship Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1729042813/marketing/US/Menu/241031_S4_Winter_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Beds',
          },
          {
            link: '/beds/beds?bed_frame_size[0]=queen',
            title: 'Queen Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139625/marketing/SG/menu%20banner/261125_Beds_QueenBeds.jpg',
            action_text: 'Shop Now',
            permalink: 'Queen Beds',
          },
          {
            link: '/furniture-sets/bedroom-sets',
            title: 'Bedroom Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710903541/marketing/SG/menu%20banner/Bed_Sets_20032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bedroom Sets',
          },
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698200397/marketing/SG/menu%20banner/Beds_25102023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1680590719/marketing/SG/menu%20banner/Beds_April2023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
        ],
        disable: false,
      },
      {
        slug: 'outdoor',
        blocks: [
          {
            link: '/outdoor/new-in',
            title: 'New Outdoor Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141189/marketing/SG/menu%20banner/261125_Outdoor_NewODArrivals.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Furniture Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141209/marketing/SG/menu%20banner/261125_Outdoor_ODFurnitureSets.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141211/marketing/SG/menu%20banner/261125_Outdoor_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
          {
            link: '/outdoor/outdoor-chairs',
            title: 'Outdoor Chairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692772420/marketing/SG/menu%20banner/SG_Outdoor_23082023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'storage',
        blocks: [
          {
            link: '/storage/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756962281/marketing/SG/menu%20banner/S325_Storage_NewIn_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/storage/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141652/marketing/SG/menu%20banner/261125_Storage_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/storage/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141654/marketing/SG/menu%20banner/261125_Storage_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/storage/tv-consoles',
            title: 'TV Consoles',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716472702/marketing/SG/menu%20banner/storage_tvconsoles_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'TV Consoles',
          },
        ],
        disable: false,
      },
      {
        slug: 'accessories',
        blocks: [
          {
            link: '/accessories/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139463/marketing/SG/menu%20banner/261125_Accessories_NewIn.jpg',
            action_text: 'View More ',
            permalink: '',
          },
          {
            link: '/accessories/mirrors',
            title: 'Wall & Floor Mirrors​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716473006/marketing/SG/menu%20banner/accessories_mirrors_23042024_Desktop.jpg',
            action_text: 'View More ',
            permalink: '',
          },
          {
            link: '/accessories/rugs',
            title: 'Rugs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764139464/marketing/SG/menu%20banner/261125_Accessories_Rugs.jpg',
            action_text: 'View More ',
            permalink: '',
          },
          {
            link: '/accessories/lighting',
            title: 'Lighting & Lamps',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1709091487/marketing/SG/menu%20banner/28022024_1_Lighting_and_lamps.jpg',
            action_text: 'View More ',
            permalink: '',
          },
          {
            link: '/accessories/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664506772/marketing/SG/menu%20banner/Accessories_Oct2022_Sale_Desktop.jpg',
            action_text: 'View More',
            permalink: '',
          },
          {
            link: '/beds/bedding',
            title: 'Bedding',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1661739440/marketing/SG/menu%20banner/Accessories_Sep22_2_Bedding.jpg',
            action_text: 'View More',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture-sets',
        blocks: [
          {
            link: '/furniture-sets/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1747275592/marketing/SG/menu%20banner/140525_S2_FurnitureSets_Bestsellers_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1761065162/marketing/SG/menu%20banner/Oct2025_Holiday_Comms_FurnitureSetsSale_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764140342/marketing/SG/menu%20banner/261125_FurnitureSets_LRSets.jpg',
            action_text: 'Shop Now',
            permalink: 'New',
          },
        ],
        disable: false,
      },
      {
        slug: 'living-room',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205099/marketing/SG/menu%20banner/20220428_AUSG_Menu_Living-Room_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/bestselling-living-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205100/marketing/SG/menu%20banner/20220428_AUSG_Menu_Living-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Bestsellers',
          },
          {
            link: '/living-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205100/marketing/SG/menu%20banner/20220428_AUSG_Menu_Living-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'dining-room',
        blocks: [
          {
            link: '/bestselling-dining-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205310/marketing/SG/menu%20banner/20220428_AUSG_Menu_Dining-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/collections/vincent-collection',
            title: 'Vincent Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205310/marketing/SG/menu%20banner/20220428_AUSG_Menu_Dining-Room_Vincent-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Vincent Collection',
          },
          {
            link: '/dining-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205310/marketing/SG/menu%20banner/20220428_AUSG_Menu_Dining-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'bedroom',
        blocks: [
          {
            link: '/products/adams-bed',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205443/marketing/SG/menu%20banner/20220428_AUSG_Menu_Bedroom_New.jpg',
            action_text: 'Shop Now',
            permalink: 'New',
          },
          {
            link: '/bestselling-bedroom-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205514/marketing/SG/menu%20banner/20220428_AUSG_Menu_Beds_Bestsellers1.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/beds/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651205443/marketing/SG/menu%20banner/20220428_AUSG_Menu_Beds_Sale1.jpg',
            action_text: 'Shop Now',
            permalink: 'All Bedroom',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-tools',
        blocks: [
          {
            link: '/interior-styling-service',
            title: 'Interior Styling Service',
            image_url: 'https://res.cloudinary.com/castlery/image/upload/v1695955768/ISS/Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Interior Styling Service',
          },
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141900/marketing/SG/menu%20banner/261125_Tools_FurnitureConfig_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141902/marketing/SG/menu%20banner/261125_Tools_RoomDesigner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1693467323/marketing/Cross-Market/menu%20banner/31082023_blog_v1_mobile.jpg',
            action_text: '',
            permalink: 'Style and Furniture Tips​',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686122585/marketing/Cross-Market/menu%20banner/07062023_Menu_Desktop_STL.jpg',
            action_text: 'Shop Now',
            permalink: 'Shop The Look',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1665480342/marketing/Cross-Market/menu%20banner/web_ar_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-category',
        blocks: [
          {
            link: '/interior-styling-service',
            title: 'Interior Styling Service',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686890209/marketing/SG/Landing%20Pages/ISS/ISS_300x200.jpg',
            action_text: '',
            permalink: '/interior-styling-service',
          },
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141905/marketing/SG/menu%20banner/261125_Tools_FurnitureConfig_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764141906/marketing/SG/menu%20banner/261125_Tools_RoomDesigner_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog/repurpose-furniture-for-christmas',
            title: 'Holiday Ideas for Home​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1700619498/marketing/Cross-Market/menu%20banner/22112023_Holiday_Menu_Mobile.jpg',
            action_text: '',
            permalink: '/holiday-ideas-for-home​',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1693467323/marketing/Cross-Market/menu%20banner/31082023_blog_v1_mobile.jpg',
            action_text: '',
            permalink: '/style-and-furniture-tips​',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/shop_the_look_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/web-ar',
            title: 'At Home with You​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1688377857/marketing/Cross-Market/menu%20banner/At_Home_With_You_03072023_Menu_Mobile.jpg',
            action_text: '',
            permalink: '/at-home-with-you',
          },
        ],
        disable: false,
      },
    ],
    lastUpdated: '2025-12-10T10:03:10.346Z',
    note: 'Fallback data for SG outer-menu. Updated: 12/10/2025, 6:03:10 PM',
  },
  us: {
    value: [
      {
        slug: 'new',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763693067/marketing/US/Menu/US_S3_Sofa_New_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763693102/marketing/US/Menu/US_S3_DesignedforLiving_New2_MB2_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/curated-by-steve-cordony',
            title: 'Curated by Steve Cordony',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750242677/marketing/AU/menu/2025_SC_New_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?quickship=true',
            title: 'New & Ready to Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741316685/marketing/US/Menu/US_S1_New_in_Ready_to_Ship_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/joy-in-every-corner',
            title: 'Joy in Every Corner',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1726659652/marketing/AU/menu/180924_Menu_S3_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'new-category',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763693381/marketing/US/Menu/US_S3_Sofa_New_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763693381/marketing/US/Menu/US_S3_DesignedforLiving_New2_MB2_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1747117093/marketing/US/Menu/US_S2_Campaign_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/curated-by-steve-cordony',
            title: 'Curated by Steve Cordony',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750242677/marketing/AU/menu/2025_SC_New_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?quickship=true',
            title: 'New & Ready to Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741316685/marketing/US/Menu/US_S1_New_in_Ready_to_Ship_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sale-category',
        blocks: [
          {
            link: '/sofas/sale',
            title: 'Sofa ',
            image_url: '',
            action_text: '',
            permalink: 'living-room',
          },
          {
            link: '/tables/sale',
            title: 'Tables',
            image_url: '',
            action_text: '',
            permalink: 'Tables',
          },
          {
            link: '/chairs/sale',
            title: 'Chairs',
            image_url: '',
            action_text: '',
            permalink: 'Chairs',
          },
          {
            link: '/beds/sale',
            title: 'Beds',
            image_url: '',
            action_text: '',
            permalink: 'bedroom',
          },
          {
            link: '/storage/sale',
            title: 'Storage',
            image_url: '',
            action_text: '',
            permalink: 'storage',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Furniture Sets',
            image_url: '',
            action_text: '',
            permalink: 'furniture set',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor',
            image_url: '',
            action_text: '',
            permalink: 'outdoor',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale',
        blocks: [
          {
            link: '/sale/holiday-sitewide-sale',
            title: 'Holiday Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764656925/marketing/US/Menu/US_Sale_HolidaySale_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741316727/marketing/US/Menu/US_S1_25_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1732512451/marketing/AU/menu/CMLC_1203_menu_Desktop.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
          {
            link: '/sale/bedroom-add-on-bundle',
            title: 'Bedroom Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1734331265/marketing/US/Menu/02012025-31012025_US_BedroomAddOn_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1684201707/marketing/US/Menu/S2_16052023_Menu_Desktop.jpg',
            action_text: 'Show Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-text',
        blocks: [
          {
            link: '/sale/holiday-sitewide-sale',
            title: 'Holiday Sale​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764656924/marketing/US/Menu/US_Sale_HolidaySale_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741316726/marketing/US/Menu/US_S1_25_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bedroom-add-on-bundle',
            title: 'Bedroom Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1734331264/marketing/US/Menu/02012025-31012025_US_BedroomAddOn_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/furniture-clearance',
            title: 'Final Sale: Up to 35% Off',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756881348/marketing/US/Menu/US_0925_FSS_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1745375494/marketing/US/Menu/USCA_Outdoor_Sale_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1747708730/marketing/CA/Menu%20Banner/CA_FSS_MB_Mobile.jpg',
            action_text: '',
            permalink: 'sale',
          },
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1657620701/marketing/Cross-Market/menu%20banner/Menu_Mobile_RTS_Owen.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'notice',
        blocks: [
          {
            link: '/new',
            title: 'New arrivals: Designs worth coming home to​',
            image_url: '',
            action_text: '',
            permalink: '',
          },
          {
            link: '/new',
            title: 'New Arrivals: Designs worth coming home to',
            image_url: '',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'notice-mobile',
        blocks: [
          {
            link: '/new',
            title: 'New arrivals: Worth coming home to',
            image_url: '',
            action_text: '',
            permalink: '',
          },
          {
            link: '/new',
            title: 'New Arrivals: Worth coming home to​',
            image_url: '',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'subscription',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sofas',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763696522/marketing/US/Menu/US_S3_Sofa_NewIn_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/sofas/sectional-sofas',
            title: 'Sectional Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763696522/marketing/US/Menu/US_S3_Sofa_SectionalSofas_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sectional Sofas',
          },
          {
            link: '/sofas/all-sofas?material_filter[0]=Performance%20Fabric&fabric_feature[0]=Spill-Resistant',
            title: 'Spill & Stain Resistant Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763696523/marketing/US/Menu/US_S3_Sofa_Spill_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Spill & Stain Resistant Sofas',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716454844/marketing/US/Menu/sofa_sets_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets​',
          },
        ],
        disable: false,
      },
      {
        slug: 'tables',
        blocks: [
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707587/marketing/US/Menu/US_S3_Table_NewIn_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/tables/dining-tables?quickship=true',
            title: 'Ready To Ship Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707587/marketing/US/Menu/US_S3_Table_RTS1_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Tables',
          },
          {
            link: '/furniture-sets/dining-room-sets?quickship=true',
            title: 'Ready To Ship Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707588/marketing/US/Menu/US_S3_Table_RTS2_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Room Sets',
          },
          {
            link: '/furniture-sets/dining-room-sets?quickship=true',
            title: 'Ready To Ship Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1708509512/marketing/US/Menu/Tables_21022024_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Room Sets',
          },
        ],
        disable: false,
      },
      {
        slug: 'chairs',
        blocks: [
          {
            link: '/chairs/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707868/marketing/US/Menu/US_S3_Chairs_NewIn_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/chairs/armchairs-accent-chairs?quickship=true',
            title: 'Ready To Ship Armchairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707867/marketing/US/Menu/US_S3_Chairs_RTS_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
          {
            link: '/chairs/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763707867/marketing/US/Menu/US_S3_Chairs_Sale_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'beds',
        blocks: [
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756353851/marketing/US/Menu/US_S3_Beds_NewIn_MB_Desktop.jpg',
            action_text: 'New In',
            permalink: 'New',
          },
          {
            link: '/beds/all-bedroom?quickship=true',
            title: 'Ready To Ship Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708333/marketing/US/Menu/US_S3_Beds_RTS_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Beds',
          },
          {
            link: '/beds/beds?bed_frame_size[0]=queen',
            title: 'Queen Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708332/marketing/US/Menu/US_S3_Beds_Queen_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Queen Beds',
          },
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698137629/marketing/US/Menu/Beds_24102023_1_New_in.jpg',
            action_text: 'New In',
            permalink: 'New',
          },
        ],
        disable: false,
      },
      {
        slug: 'storage',
        blocks: [
          {
            link: '/storage/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756354259/marketing/US/Menu/US_S3_Storage_NewIn_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708613/marketing/US/Menu/US_S3_Storage_Bestsellers_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/storage/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708612/marketing/US/Menu/US_S3_Storage_Sale_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/storage/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698137775/marketing/US/Menu/Storage_24102023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture-sets',
        blocks: [
          {
            link: '/furniture-sets/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1746779541/marketing/US/Menu/US_S2_Bestsellers_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708899/marketing/US/Menu/US_S3_FS_LRS_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763708900/marketing/US/Menu/US_S3_FS_Sale_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'outdoor',
        blocks: [
          {
            link: '/outdoor/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741319519/marketing/US/Menu/US_S1_New_In_Outdoor_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709267/marketing/US/Menu/US_S3_Out_OFS_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756360783/marketing/US/Menu/US_S3_Outdoor_Sale_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'accessories',
        blocks: [
          {
            link: '/accessories/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709611/marketing/US/Menu/US_S3_Accessories_NewIn_MB_Desktop_V2.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/rugs',
            title: 'Rugs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742891239/marketing/CA/Menu%20Banner/CA_Rugs_Menu_Banner_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/mirrors',
            title: 'Wall & Floor Mirrors​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709612/marketing/US/Menu/US_S3_Accessories_Mirrors_MB_Desktop_V2.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/lighting',
            title: 'Lighting & Lamps',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1708509615/marketing/US/Menu/Accessories_21022024_1_Lighting_and_lamps.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/beds/bedding',
            title: 'Bedding',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1672365943/marketing/US/Menu/Accessories_30122022_2_Bedding.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1680596199/marketing/US/Menu/Accessories_04April2023_Sale_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'living-room',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/bestselling-living-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Bestsellers',
          },
          {
            link: '/living-room-sale',
            title: 'Living Room on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'dining-room',
        blocks: [
          {
            link: '/bestselling-dining-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134507/marketing/US/Menu/20220428_US_Menu_Dining-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/products/seb-extendable-dining-table',
            title: 'Seb Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134508/marketing/US/Menu/20220428_US_Menu_Dining-Room_Seb-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Seb Collection',
          },
          {
            link: '/dining-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134507/marketing/US/Menu/20220428_US_Menu_Dining-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'bedroom',
        blocks: [
          {
            link: '/products/adams-bed',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_New.jpg',
            action_text: 'New In',
            permalink: 'New',
          },
          {
            link: '/bestselling-bedroom-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/bedroom/beds',
            title: 'Padded Headboards',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_Padded-Headboards.jpg',
            action_text: 'Shop Now',
            permalink: 'Padded Headboards',
          },
        ],
        disable: false,
      },
      {
        slug: 'home-office',
        blocks: [
          {
            link: '/products/emmerson-adjustable-standing-desk',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office',
          },
          {
            link: '/home-office-bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Bestsellers',
          },
          {
            link: '/home-office-shelves',
            title: 'Display Shelves',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_Shelves.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Shelves',
          },
        ],
        disable: false,
      },
      {
        slug: 'entryway',
        blocks: [
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646036665/marketing/Cross-Market/menu%20banner/Menu_Desktop_Bestseller_Storage.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/entryway',
            title: 'Entryway',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646992110/marketing/Cross-Market/menu%20banner/Menu_Entryway_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Entryway',
          },
          {
            link: '/mid-century-modern-charmers',
            title: 'Mid-Century Modern Charmers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646038026/marketing/Cross-Market/menu%20banner/Menu_Desktop_MidCentryModern.jpg',
            action_text: 'Shop Now',
            permalink: 'Mid-Century Modern',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-tools',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709962/marketing/US/Menu/US_S3_Tools_FCT_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709965/marketing/US/Menu/US_S3_Tools_RD_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763709961/marketing/US/Menu/US_S3_Tools_Tips_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look/living-room',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686122585/marketing/Cross-Market/menu%20banner/07062023_Menu_Desktop_STL.jpg',
            action_text: 'Shop Now',
            permalink: 'Shop The Look',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1665480342/marketing/Cross-Market/menu%20banner/web_ar_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/family-friendly-homes',
            title: 'Family-Friendly Homes',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722221391/marketing/Cross-Market/menu%20banner/290724_Family-Friendly_Homes.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/small-space-and-apartment-furniture',
            title: 'Furniture for Small Spaces',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722823593/marketing/US/Menu/08052024_Small_Space_and_Apartment_Furniture_Menu_Mobile.jpg',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-category',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763710304/marketing/US/Menu/US_S3_Tools_FCT_MB_Mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763710300/marketing/US/Menu/US_S3_Tools_RD_MB_Mobile_V2.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763710299/marketing/US/Menu/US_S3_Tools_Tips_MB_Mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look/living-room',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/shop_the_look_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1688377857/marketing/Cross-Market/menu%20banner/At_Home_With_You_03072023_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/family-friendly-homes',
            title: 'Family-Friendly Homes',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722221391/marketing/Cross-Market/menu%20banner/290724_Family-Friendly_Homes.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/small-space-and-apartment-furniture',
            title: 'Furniture for Small Spaces',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722823593/marketing/US/Menu/08052024_Small_Space_and_Apartment_Furniture_Menu_Mobile.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/home-tours',
            title: 'Home Tours',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1726023481/At%20Home%20with%20Castlery/Menu_HomeTours.jpg',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
    ],
    lastUpdated: '2025-12-10T10:03:10.871Z',
    note: 'Fallback data for US outer-menu. Updated: 12/10/2025, 6:03:10 PM',
  },
  au: {
    value: [
      {
        slug: 'new',
        blocks: [
          {
            link: '/new',
            title: 'New arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456641/marketing/AU/menu/2025_BF_New_arrivals_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456641/marketing/AU/menu/2025_BR_DSF_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/curated-by-steve-cordony',
            title: 'Curated by Steve Cordony',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456641/marketing/AU/menu/25_BF_Steve_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741672329/marketing/AU/menu/S1_25_brand_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/new?lead_time[0]=0_15&lead_time[1]=0_3',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741576071/marketing/AU/menu/S1_25_New_in_quick_ship_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/customisation-service',
            title: 'Customisation Service​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722838356/marketing/US/Menu/08082024_Customisation_Launch_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Customisation Service​',
          },
          {
            link: '/boldly-elevated',
            title: 'Limited Edition Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698299258/marketing/AU/menu/26102023_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sophisticated-living',
            title: 'Sophisticated Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692771400/marketing/AU/menu/AU_Sofa_23082023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'new-category',
        blocks: [
          {
            link: '/new',
            title: 'New arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456641/marketing/AU/menu/2025_BF_New_arrivals_Mobile_1.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456641/marketing/AU/menu/2025_BR_DSF_Mobile_2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/curated-by-steve-cordony',
            title: 'Curated by Steve Cordony',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763456644/marketing/AU/menu/25_BF_Steve_Mobile_3.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741672329/marketing/AU/menu/S1_25_brand_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/new?lead_time[0]=0_15&lead_time[1]=0_3',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741576070/marketing/AU/menu/S1_25_New_in_quick_ship_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/customisation-service',
            title: 'Customisation Service​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722838356/marketing/US/Menu/08082024_Customisation_Launch_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Customisation Service​',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture',
        blocks: [],
        disable: false,
      },
      {
        slug: 'accessories',
        blocks: [
          {
            link: '/accessories/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960165/marketing/AU/menu/25_BF_ACCESSORIES_Desktop_1.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/rugs',
            title: 'Rugs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960165/marketing/AU/menu/25_BF_ACCESSORIES_Desktop_2.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/mirrors',
            title: 'Wall & Floor Mirrors​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716457356/marketing/AU/home/accessories_mirrors_23042024_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/cutlery-set',
            title: 'Cutlery set',
            image_url: '',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/glassware',
            title: 'Glassware',
            image_url: '',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/lighting',
            title: 'Lighting & Lamps',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1708508520/marketing/AU/menu/accessories_21022024_1_Lighting_and_lamps.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443491/marketing/AU/menu/Accessories_Oct2022_Sale_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/beds/bedding',
            title: 'Bedding',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443483/marketing/AU/menu/Accessories_Oct2022_Bedding_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/ready-ship?category[0]=accessories&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443491/marketing/AU/menu/Accessories_Oct2022_Sale_Desktop.jpg',
            action_text: '',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale',
        blocks: [
          {
            link: '/sale/holiday-storewide-sale',
            title: 'Holiday Storewide Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764747779/marketing/AU/menu/25_Holiday_regular_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/furniture-clearance',
            title: 'Furniture Clearance',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960594/marketing/AU/menu/25_BF_SALE_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960594/marketing/AU/menu/25_BF_SALE_Desktop_3.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Bundles Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443761/marketing/AU/menu/Outdoor_Bundle_Oct2022_Sale_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-text',
        blocks: [
          {
            link: '/sale/holiday-storewide-sale',
            title: 'Holiday Storewide Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764747779/marketing/AU/menu/25_Holiday_regular_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/furniture-clearance',
            title: 'Furniture Clearance',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960594/marketing/AU/menu/25_BF_SALE_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960594/marketing/AU/menu/25_BF_SALE_Desktop_3.jpg',
            action_text: '',
            permalink: 'sale',
          },
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1657620701/marketing/Cross-Market/menu%20banner/Menu_Mobile_RTS_Owen.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-category',
        blocks: [
          {
            link: '/sofas/sale',
            title: 'Sofa ',
            image_url: '',
            action_text: '',
            permalink: 'living-room',
          },
          {
            link: '/tables/sale',
            title: 'Tables',
            image_url: '',
            action_text: '',
            permalink: 'Tables',
          },
          {
            link: '/chairs/sale',
            title: 'Chairs',
            image_url: '',
            action_text: '',
            permalink: 'Chairs',
          },
          {
            link: '/beds/sale',
            title: 'Beds',
            image_url: '',
            action_text: '',
            permalink: 'bedroom',
          },
          {
            link: '/storage/sale',
            title: 'Storage',
            image_url: '',
            action_text: '',
            permalink: 'storage',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1611197616/marketing/Cross-Market/menu%20banner/Menu_Desktop_VincentBundle.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor ',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1633671795/marketing/Cross-Market/menu%20banner/Menu_OutdoorSale_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
        ],
        disable: false,
      },
      {
        slug: 'outdoor',
        blocks: [
          {
            link: '/outdoor/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959889/marketing/AU/menu/25_BF_OUTDOOR_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/outdoor/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756783127/marketing/AU/menu/2025_S3_Outdoor_bestseller_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959889/marketing/AU/menu/25_BF_OUTDOOR_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Furniture Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710842386/marketing/AU/menu/Outdoor_OFS_19032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
          {
            link: '/outdoor/outdoor-sofas',
            title: 'Outdoor Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692771878/marketing/AU/menu/AU_Outdoor_23082023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/ready-ship?category[0]=outdoor&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443297/marketing/AU/menu/Outdoor_Oct2022_New-In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'sofas',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763958815/marketing/AU/menu/25_BF_SOFA_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/sofas/sectional-sofas',
            title: 'Sectional Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763958815/marketing/AU/menu/25_BF_SOFA_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sectional Sofas',
          },
          {
            link: '/sofas/all-sofas?fabric_feature[0]=Spill-resistant%20&fabric_feature[1]=Stain-resistant%20%26%20Pet-friendly​',
            title: 'Spill & Stain Resistant Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763958815/marketing/AU/menu/25_BF_SOFA_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Spill & Stain Resistant Sofas',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698742232/marketing/AU/menu/CMS_31102023_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698199183/marketing/AU/menu/Sofa_25102023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/ready-ship?category[0]=sofas&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1675061449/marketing/AU/menu/Sofas_30012023_2_Elias-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
          {
            link: '/sofas/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1675061449/marketing/AU/menu/Sofas_30012023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'tables',
        blocks: [
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959092/marketing/AU/menu/25_BF_TABLE_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables New In',
          },
          {
            link: 'tables/dining-tables?lead_time[0]=0_3&lead_time[1]=0_15',
            title: 'Ready To Ship Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959093/marketing/AU/menu/25_BF_TABLE_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Tables',
          },
          {
            link: '/furniture-sets/dining-room-sets?lead_time[0]=0_15&lead_time[1]=0_3​',
            title: 'Ready To Ship Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1666837395/marketing/US/Menu/Tables_27102022_New-In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Dining Room Sets',
          },
          {
            link: '/tables/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664442416/marketing/AU/menu/Tables_Oct2022_Bestsellers_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1700534974/marketing/AU/menu/21112023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables New In',
          },
          {
            link: '/ready-ship?category[0]=tables&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1680581086/marketing/AU/menu/Tables_April2023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'chairs',
        blocks: [
          {
            link: '/chairs/dining-chairs',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959306/marketing/AU/menu/25_BF_CHAIRS_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Chairs',
          },
          {
            link: '/chairs/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959306/marketing/AU/menu/25_BF_CHAIRS_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/chairs/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959306/marketing/AU/menu/25_BF_CHAIRS_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/chairs/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698199379/marketing/AU/menu/Chairs_25102023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'New In ',
          },
          {
            link: '/ready-ship?category[0]=chairs&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1677636867/marketing/AU/menu/Chairs_01032023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'beds',
        blocks: [
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756721129/marketing/AU/menu/2025_S3_Bed_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/beds/all-bedroom?lead_time[0]=0_15&lead_time[1]=0_3​',
            title: 'Ready To Ship Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959507/marketing/AU/menu/25_BF_BEDS_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship Beds',
          },
          {
            link: '/beds/beds?bed_frame_size[0]=queen',
            title: 'Queen Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959507/marketing/AU/menu/25_BF_BEDS_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Queen Beds',
          },
          {
            link: '/furniture-sets/bedroom-sets',
            title: 'Bedroom Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710903541/marketing/SG/menu%20banner/Bed_Sets_20032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bedroom Sets​',
          },
          {
            link: '/beds/fabric-bed-frames',
            title: 'Padded Headboards',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664442710/marketing/AU/menu/Beds_Oct2022_Padded-Headboards_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Padded Headboards',
          },
          {
            link: '/beds/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698199472/marketing/AU/menu/Beds_25102023_1_New_in.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/ready-ship?category[0]=beds&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692771755/marketing/AU/menu/AU_Beds_23082023_2_Ready_to_ship.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
          {
            link: '/collections/emery-collection',
            title: 'Emery Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1666835603/marketing/US/Menu/Beds_27102022_New-In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Emery Collection',
          },
        ],
        disable: false,
      },
      {
        slug: 'storage',
        blocks: [
          {
            link: '/storage/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756721242/marketing/AU/menu/2025_S3_Storage_New_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/storage/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959576/marketing/AU/menu/25_BF_storage_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/storage/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959576/marketing/AU/menu/25_BF_storage_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/storage/tv-units',
            title: 'TV Units',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716457226/marketing/AU/home/tvunits_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'TV Units',
          },
          {
            link: '/ready-ship?category[0]=storage&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1677636913/marketing/AU/menu/Storage_01032023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture-sets',
        blocks: [
          {
            link: '/furniture-sets/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763959687/marketing/AU/menu/25_BF_FURNITURESET_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756791412/marketing/AU/menu/2025_S3_Outdoor_Furniture_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Outdoor Furniture Sets',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1760600977/marketing/AU/menu/2025_Holiday_Comms_furniture_set_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/ready-ship?category[0]=furniture-sets&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1677636960/marketing/AU/menu/Sets_01032023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'living-room',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1729563003/marketing/AU/menu/S4_1101_sofa_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/bestselling-living-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197083/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Living-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Bestsellers',
          },
          {
            link: '/living-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197084/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Living-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'dining-room',
        blocks: [
          {
            link: '/bestselling-dining-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/collections/vincent-collection',
            title: 'Vincent Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Vincent-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Vincent Collection',
          },
          {
            link: '/dining-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'bedroom',
        blocks: [
          {
            link: '/products/adams-bed',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197436/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Bedroom_New.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/bestselling-bedroom-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651194445/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Beds_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/bedroom-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198207/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Beds_Sale1.jpg',
            action_text: 'Shop Now',
            permalink: 'All Bedroom',
          },
        ],
        disable: false,
      },
      {
        slug: 'home-office',
        blocks: [
          {
            link: '/products/emmerson-adjustable-standing-desk',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office',
          },
          {
            link: '/home-office-bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Bestsellers',
          },
          {
            link: '/home-office-shelves',
            title: 'Display Shelves',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_Shelves.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Shelves',
          },
        ],
        disable: false,
      },
      {
        slug: 'entryway',
        blocks: [
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646036665/marketing/Cross-Market/menu%20banner/Menu_Desktop_Bestseller_Storage.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/entryway',
            title: 'Entryway',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646992110/marketing/Cross-Market/menu%20banner/Menu_Entryway_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Entryway',
          },
          {
            link: '/mid-century-modern-charmers',
            title: 'Mid-Century Modern Charmers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646038026/marketing/Cross-Market/menu%20banner/Menu_Desktop_MidCentryModern.jpg',
            action_text: 'Shop Now',
            permalink: 'Mid-Century Modern',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-tools',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960274/marketing/AU/menu/25_BF_TOOLS_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960275/marketing/AU/menu/25_BF_TOOLS_Desktop_2.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960274/marketing/AU/menu/25_BF_TOOLS_Desktop_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686122585/marketing/Cross-Market/menu%20banner/07062023_Menu_Desktop_STL.jpg',
            action_text: 'Shop Now',
            permalink: 'Shop The Look',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1665480342/marketing/Cross-Market/menu%20banner/web_ar_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/family-friendly-homes',
            title: 'Family-Friendly Homes',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1721379883/marketing/AU/menu/22072024_Menu_Mobile.jpg',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-category',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960273/marketing/AU/menu/25_BF_TOOLS_Mobile_1.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960274/marketing/AU/menu/25_BF_TOOLS_Mobile_2.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763960274/marketing/AU/menu/25_BF_TOOLS_Mobile_3.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/shop_the_look_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1688377857/marketing/Cross-Market/menu%20banner/At_Home_With_You_03072023_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
    ],
    lastUpdated: '2025-12-10T10:03:11.384Z',
    note: 'Fallback data for AU outer-menu. Updated: 12/10/2025, 6:03:11 PM',
  },
  ca: {
    value: [
      {
        slug: 'new',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036491/marketing/CA/Menu%20Banner/CA_S3_New_NewArrivals_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036489/marketing/CA/Menu%20Banner/CA_S3_New_DFL_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036488/marketing/CA/Menu%20Banner/CA_S3_New_WCHT_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/accessories/all-accessories',
            title: 'Accessories',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742810396/marketing/CA/Menu%20Banner/CA_Menu_Accessories_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'new-category',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036637/marketing/CA/Menu%20Banner/CA_S3_New_NewArrivals_MB_mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036635/marketing/CA/Menu%20Banner/CA_S3_New_DFL_MB_mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764036634/marketing/CA/Menu%20Banner/CA_S3_New_WCHT_MB_mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/accessories/all-accessories',
            title: 'Accessories',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742810395/marketing/CA/Menu%20Banner/CA_Menu_Accessories_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sale-category',
        blocks: [
          {
            link: '/sofas/sale',
            title: 'Sofa ',
            image_url: '',
            action_text: '',
            permalink: 'living-room',
          },
          {
            link: '/tables/sale',
            title: 'Tables',
            image_url: '',
            action_text: '',
            permalink: 'Tables',
          },
          {
            link: '/chairs/sale',
            title: 'Chairs',
            image_url: '',
            action_text: '',
            permalink: 'Chairs',
          },
          {
            link: '/beds/sale',
            title: 'Beds',
            image_url: '',
            action_text: '',
            permalink: 'bedroom',
          },
          {
            link: '/storage/sale',
            title: 'Storage',
            image_url: '',
            action_text: '',
            permalink: 'storage',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Furniture Sets',
            image_url: '',
            action_text: '',
            permalink: 'furniture set',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor',
            image_url: '',
            action_text: '',
            permalink: 'outdoor',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale',
        blocks: [
          {
            link: '/sale/boxing-day-sale',
            title: 'Boxing Day Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764725613/marketing/CA/Menu%20Banner/CA_Sale_BSS_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1745808407/marketing/CA/Menu%20Banner/CA_VDS_Regular_Menu_Banner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692770817/marketing/US/Menu/US_Table_23042023_1_New_in.jpg',
            action_text: '',
            permalink: 'sale',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651196630/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Outdoor_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-text',
        blocks: [
          {
            link: '/sale/boxing-day-sale',
            title: 'Boxing Day Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764725613/marketing/CA/Menu%20Banner/CA_Sale_BSS_MB_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/living-add-on-bundle',
            title: 'Living Room Add-on Bundle',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1745808406/marketing/CA/Menu%20Banner/CA_VDS_Regular_Menu_Banner_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692770817/marketing/US/Menu/US_Table_23042023_1_New_in.jpg',
            action_text: '',
            permalink: 'sale',
          },
          {
            link: '/outdoor/sale',
            title: 'Outdoor Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1745375494/marketing/US/Menu/USCA_Outdoor_Sale_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'subscription',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sofas',
        blocks: [
          {
            link: '/sofas/3-seater-sofas',
            title: '3-Seater Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037305/marketing/CA/Menu%20Banner/CA_S3_Sofas_3Seater_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: '3-Seater Sofas',
          },
          {
            link: '/sofas/sectional-sofas',
            title: 'Sectional Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037304/marketing/CA/Menu%20Banner/CA_S3_Sofas_Sectional_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Sectional Sofas',
          },
          {
            link: '/sofas/loveseats',
            title: 'Loveseats',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756362100/marketing/CA/Menu%20Banner/CA_S3_Sofa_Loveseat_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Loveseats',
          },
        ],
        disable: false,
      },
      {
        slug: 'tables',
        blocks: [
          {
            link: '/tables/dining-tables',
            title: 'Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037626/marketing/CA/Menu%20Banner/CA_S3_Tables_DiningTables_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Tables',
          },
          {
            link: '/tables/coffee-tables',
            title: 'Coffee Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037625/marketing/CA/Menu%20Banner/CA_S3_Tables_CoffeeTables_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Coffee Tables',
          },
          {
            link: '/tables/console-tables',
            title: 'Console & Entryway Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742891256/marketing/CA/Menu%20Banner/CA_Console_Table_Menu_Banner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Console & Entryway Tables',
          },
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1735010587/marketing/US/Menu/US_Jan_Tables_New_In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/tables/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1708509512/marketing/US/Menu/Tables_21022024_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'chairs',
        blocks: [
          {
            link: '/chairs/dining-chairs',
            title: 'Dining Chairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037883/marketing/CA/Menu%20Banner/CA_S3_Chairs_DiningChairs_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Chairs',
          },
          {
            link: '/chairs/armchairs-accent-chairs',
            title: 'Armchairs and Accent Chairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037880/marketing/CA/Menu%20Banner/CA_S3_Chairs_Armchair_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Armchairs and Accent Chairs',
          },
          {
            link: '/chairs/stools-bar-stools',
            title: 'Stools & Bar Stools',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764037878/marketing/CA/Menu%20Banner/CA_S3_Chairs_Stools_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Stools & Bar Stools',
          },
          {
            link: '/chairs/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716455000/marketing/US/Menu/chairs_bestsellers_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/chairs/sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716455012/marketing/US/Menu/chairs_sale_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'beds',
        blocks: [
          {
            link: '/beds/beds',
            title: 'Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038183/marketing/CA/Menu%20Banner/CA_S3_Beds_Beds_MB_Desktop_V2.jpg',
            action_text: 'New In',
            permalink: 'Beds',
          },
          {
            link: '/beds/nightstands',
            title: 'Nightstands & Bedside Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038179/marketing/CA/Menu%20Banner/CA_S3_Beds_Nightstands_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Nightstands & Bedside Tables',
          },
          {
            link: '/beds/dressers',
            title: 'Dressers & Chest of Drawers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038178/marketing/CA/Menu%20Banner/CA_S3_Beds_Dressers_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Dressers & Chest of Drawers',
          },
          {
            link: '/beds/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710832110/marketing/US/Menu/Beds_NewIn_19032024_Desktop.jpg',
            action_text: 'New In',
            permalink: 'Bestsellers',
          },
        ],
        disable: false,
      },
      {
        slug: 'storage',
        blocks: [
          {
            link: '/storage/tv-stands',
            title: 'TV Stands',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716455294/marketing/US/Menu/Storage_tvstands_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'TV Stands',
          },
          {
            link: '/storage/sideboards-cabinets',
            title: 'Sideboard & Buffet Cabinets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756364017/marketing/CA/Menu%20Banner/CA_S3_Storage_Sideboard_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Sideboard & Buffet Cabinets',
          },
          {
            link: '/beds/dressers',
            title: 'Dressers & Chest of Drawers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038432/marketing/CA/Menu%20Banner/CA_S3_Storage_Dressers_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Dressers & Chest of Drawers',
          },
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716455294/marketing/US/Menu/Storage_tvstands_23042024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture-sets',
        blocks: [
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038684/marketing/CA/Menu%20Banner/CA_S3_FS_LRS_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
          {
            link: '/furniture-sets/dining-room-sets',
            title: 'Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1747119389/marketing/CA/Menu%20Banner/CA_S2_DiningSets_MB_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room Sets',
          },
          {
            link: '/furniture-sets/bedroom-sets',
            title: 'Bedroom Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038683/marketing/CA/Menu%20Banner/CA_S3_FS_BS_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Bedroom Sets',
          },
        ],
        disable: false,
      },
      {
        slug: 'outdoor',
        blocks: [
          {
            link: '/outdoor/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038883/marketing/CA/Menu%20Banner/CA_S3_Outdoor_NewIn_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/furniture-sets/outdoor-patio-sets',
            title: 'Outdoor & Patio Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038882/marketing/CA/Menu%20Banner/CA_S3_Outdoor_Patio_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/outdoor-dining-and-bar-tables',
            title: 'Outdoor Dining & Bar Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764038886/marketing/CA/Menu%20Banner/CA_S3_Outdoor_Dining_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/outdoor-lounge-chairs',
            title: 'Outdoor Lounge Chairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742891274/marketing/CA/Menu%20Banner/CA_Outdoor_Lounge_Chair_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'accessories',
        blocks: [
          {
            link: '/accessories/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1758769066/marketing/CA/Menu%20Banner/S3_25_Accessories_New_In-Desktop.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/accessories/mirrors',
            title: 'Wall & Floor Mirrors​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1726557759/marketing/US/Menu/US_S3_1909_Desktop_Accessories_New_In.jpg',
            action_text: 'View More >',
            permalink: '',
          },
          {
            link: '/accessories/lighting',
            title: 'Lighting & Lamps',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039077/marketing/CA/Menu%20Banner/CA_S3_Accessories_Lighting_MB_Desktop_V2.jpg',
            action_text: 'View More >',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'living-room',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/bestselling-living-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Bestsellers',
          },
          {
            link: '/living-room-sale',
            title: 'Living Room on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134293/marketing/US/Menu/20220428_US_Menu_Living-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'dining-room',
        blocks: [
          {
            link: '/bestselling-dining-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134507/marketing/US/Menu/20220428_US_Menu_Dining-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/products/seb-extendable-dining-table',
            title: 'Seb Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134508/marketing/US/Menu/20220428_US_Menu_Dining-Room_Seb-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Seb Collection',
          },
          {
            link: '/dining-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134507/marketing/US/Menu/20220428_US_Menu_Dining-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'bedroom',
        blocks: [
          {
            link: '/products/adams-bed',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_New.jpg',
            action_text: 'New In',
            permalink: 'New',
          },
          {
            link: '/bestselling-bedroom-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/bedroom/beds',
            title: 'Padded Headboards',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651134584/marketing/US/Menu/20220428_US_Menu_Bedoom_Padded-Headboards.jpg',
            action_text: 'Shop Now',
            permalink: 'Padded Headboards',
          },
        ],
        disable: false,
      },
      {
        slug: 'home-office',
        blocks: [
          {
            link: '/products/emmerson-adjustable-standing-desk',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office',
          },
          {
            link: '/home-office-bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Bestsellers',
          },
          {
            link: '/home-office-shelves',
            title: 'Display Shelves',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651135321/marketing/US/Menu/20220428_US_Menu_Home-Office_Shelves.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Shelves',
          },
        ],
        disable: false,
      },
      {
        slug: 'entryway',
        blocks: [
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646036665/marketing/Cross-Market/menu%20banner/Menu_Desktop_Bestseller_Storage.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/entryway',
            title: 'Entryway',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646992110/marketing/Cross-Market/menu%20banner/Menu_Entryway_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Entryway',
          },
          {
            link: '/mid-century-modern-charmers',
            title: 'Mid-Century Modern Charmers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646038026/marketing/Cross-Market/menu%20banner/Menu_Desktop_MidCentryModern.jpg',
            action_text: 'Shop Now',
            permalink: 'Mid-Century Modern',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-tools',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039207/marketing/CA/Menu%20Banner/CA_S3_Tools_FCT_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039214/marketing/CA/Menu%20Banner/CA_S3_Tools_RoomDesigner_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039216/marketing/CA/Menu%20Banner/CA_S3_Tools_StyleTips_MB_Desktop_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look/living-room',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686122585/marketing/Cross-Market/menu%20banner/07062023_Menu_Desktop_STL.jpg',
            action_text: 'Shop Now',
            permalink: 'Shop The Look',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1665480342/marketing/Cross-Market/menu%20banner/web_ar_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-category',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039204/marketing/CA/Menu%20Banner/CA_S3_Tools_FCT_MB_Mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039210/marketing/CA/Menu%20Banner/CA_S3_Tools_RoomDesigner_MB_Mobile_V2.jpg',
            action_text: '',
            permalink: '',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764039201/marketing/CA/Menu%20Banner/CA_S3_Tools_StyleTips_MB_Mobile_V2.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look/living-room',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/shop_the_look_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1688377857/marketing/Cross-Market/menu%20banner/At_Home_With_You_03072023_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
    ],
    lastUpdated: '2025-12-10T10:03:12.620Z',
    note: 'Fallback data for CA outer-menu. Updated: 12/10/2025, 6:03:12 PM',
  },
  uk: {
    value: [
      {
        slug: 'new',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756362955/marketing/UK/Menu%20Banners/040925_NewArrivalMenu_Esmee_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new',
            title: 'Designed for Living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764147768/marketing/UK/menu/25_BF_NewDFL_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?tags[0]=new&lead_time[0]=0_15',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764147761/marketing/UK/menu/25_BF_NewRTS_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/worth-coming-home-to',
            title: 'Worth Coming Home To',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750754713/marketing/UK/Menu%20Banners/240625_UK_WCHT_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/accessories/all-accessories',
            title: 'Accessories',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742810396/marketing/CA/Menu%20Banner/CA_Menu_Accessories_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?tags[0]=new&lead_time[0]=0_15',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741576071/marketing/AU/menu/S1_25_New_in_quick_ship_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'new-category',
        blocks: [
          {
            link: '/new',
            title: 'New Arrivals',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756264923/marketing/UK/Menu%20Banners/040925_S3_MenuBanner_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/designed-for-living',
            title: 'Designed for living',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764147761/marketing/UK/menu/25_BF_NewDFL_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?tags[0]=new&lead_time[0]=0_15',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1764147761/marketing/UK/menu/25_BF_NewRTS_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/accessories/all-accessories',
            title: 'Accessories',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1742810395/marketing/CA/Menu%20Banner/CA_Menu_Accessories_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/new?tags[0]=new&lead_time[0]=0_15',
            title: 'New & Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1741576070/marketing/AU/menu/S1_25_New_in_quick_ship_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sale',
        blocks: [
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1754853181/marketing/UK/Menu%20Banners/080825_Ready_To_Ship_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763632142/marketing/UK/Menu%20Banners/bundlesonsale_Desktop.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'sale-text',
        blocks: [
          {
            link: '/sale/bundle-sale',
            title: 'Bundles on Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763632382/marketing/UK/Menu%20Banners/bundleonsale_mobile.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
          {
            link: '/ready-ship',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1754853180/marketing/UK/Menu%20Banners/080825_Ready_To_Ship_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'london-townhouse',
        blocks: [],
        disable: false,
      },
      {
        slug: 'sale-category',
        blocks: [
          {
            link: '/sofas/sale',
            title: 'Sofa ',
            image_url: '',
            action_text: '',
            permalink: 'living-room',
          },
          {
            link: '/tables/sale',
            title: 'Tables',
            image_url: '',
            action_text: '',
            permalink: 'Tables',
          },
          {
            link: '/chairs/sale',
            title: 'Chairs',
            image_url: '',
            action_text: '',
            permalink: 'Chairs',
          },
          {
            link: '/beds/sale',
            title: 'Beds',
            image_url: '',
            action_text: '',
            permalink: 'bedroom',
          },
          {
            link: '/storage/sale',
            title: 'Storage',
            image_url: '',
            action_text: '',
            permalink: 'storage',
          },
          {
            link: '/furniture-sets/sale',
            title: 'Furniture Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1611197616/marketing/Cross-Market/menu%20banner/Menu_Desktop_VincentBundle.jpg',
            action_text: 'Buy More, Save More',
            permalink: 'sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'accessories',
        blocks: [
          {
            link: '/accessories/rugs',
            title: 'Rugs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631671/marketing/UK/Menu%20Banners/Rugs_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Rugs',
          },
          {
            link: '/accessories/tableware',
            title: 'Tableware',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750760116/marketing/UK/Menu%20Banners/240625_UK_Tableware_Accessories_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Tableware',
          },
          {
            link: '/accessories/lighting',
            title: 'Lighting & Lamps',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631673/marketing/UK/Menu%20Banners/Lighting_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Lighting & Lamps',
          },
          {
            link: '/accessories/mirrors',
            title: 'Wall & Floor Mirrors​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1716457356/marketing/AU/home/accessories_mirrors_23042024_Desktop.jpg',
            action_text: 'View More >',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'outdoor',
        blocks: [
          {
            link: '/outdoor/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1729565830/marketing/AU/menu/S4_011124_Desktop_Outdoor_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/outdoor/bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443297/marketing/AU/menu/Outdoor_Oct2022_New-In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
          {
            link: '/outdoor/sale',
            title: 'Sale: Extra up to 40% off',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1713929273/marketing/US/Menu/24042024_Menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
          {
            link: '/furniture-sets/outdoor-sets',
            title: 'Outdoor Furniture Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710842386/marketing/AU/menu/Outdoor_OFS_19032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'outdoor',
          },
          {
            link: '/outdoor/outdoor-sofas',
            title: 'Outdoor Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1692771878/marketing/AU/menu/AU_Outdoor_23082023_1_New_In.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
          {
            link: '/ready-ship?category[0]=outdoor&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1664443297/marketing/AU/menu/Outdoor_Oct2022_New-In_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'sofas',
        blocks: [
          {
            link: '/sofas/all-sofas?lead_time[0]=0_15',
            title: 'Ready-to-Ship Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619221/marketing/UK/Menu%20Banners/RTS_Sofa.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready-to-Ship Sofas',
          },
          {
            link: '/sofas/3-seater-sofas',
            title: '3-Seater Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619224/marketing/UK/Menu%20Banners/3seater_sofa.jpg',
            action_text: 'Shop Now',
            permalink: '3-Seater Sofas',
          },
          {
            link: '/sofas/corner-sofas',
            title: 'Corner Sofas',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619225/marketing/UK/Menu%20Banners/corner%20sofa.jpg',
            action_text: 'Shop Now',
            permalink: 'Corner Sofas',
          },
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1698742232/marketing/AU/menu/CMS_31102023_Menu_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
        ],
        disable: false,
      },
      {
        slug: 'tables',
        blocks: [
          {
            link: 'tables/dining-tables',
            title: 'Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619317/marketing/UK/Menu%20Banners/Dining%20Tables_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Tables',
          },
          {
            link: '/tables/dining-tables?lead_time[0]=3_15',
            title: 'Ready-to-Ship Dining Tables',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619319/marketing/UK/Menu%20Banners/RTS_Dining%20Table_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready-to-Ship Dining Tables',
          },
          {
            link: '/furniture-sets/dining-room-sets',
            title: 'Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763619320/marketing/UK/Menu%20Banners/Dining%20Room%20Sets_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room Sets',
          },
          {
            link: '/tables/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756451899/marketing/UK/Menu%20Banners/040925_S3_Austen_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New in',
          },
          {
            link: '/ready-ship?category[0]=tables&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1680581086/marketing/AU/menu/Tables_April2023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'chairs',
        blocks: [
          {
            link: 'uk/chairs/new-in',
            title: 'New in',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631358/marketing/UK/Menu%20Banners/Chair_NewIn_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New in',
          },
          {
            link: 'uk/chairs/armchairs?lead_time[0]=0_15',
            title: 'Ready-to-ship Armchairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631360/marketing/UK/Menu%20Banners/Chair_RTS_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready-to-ship Armchairs',
          },
          {
            link: '/chairs/dining-chairs',
            title: 'Dining Chairs',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631362/marketing/UK/Menu%20Banners/DiningChair_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Chairs',
          },
          {
            link: '/ready-ship?category[0]=chairs&lead_time[0]=3_8',
            title: 'Ready To Ship',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1677636867/marketing/AU/menu/Chairs_01032023_3_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready To Ship',
          },
        ],
        disable: false,
      },
      {
        slug: 'beds',
        blocks: [
          {
            link: 'uk/beds/new-in',
            title: 'New in',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756453227/marketing/UK/Menu%20Banners/040925_s3_bed_menu_newin_Desktop_1.jpg',
            action_text: 'Shop Now',
            permalink: 'New in',
          },
          {
            link: '/beds/all-bedroom?lead_time[0]=0_15',
            title: 'Ready-to-Ship Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631475/marketing/UK/Menu%20Banners/RTS_Bed_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Ready-to-Ship Beds',
          },
          {
            link: 'uk/beds/beds?bed_frame_size[0]=uk_king',
            title: 'King Beds',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631477/marketing/UK/Menu%20Banners/King_Bed_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'King Beds',
          },
          {
            link: '/furniture-sets/bedroom-sets',
            title: 'Bedroom Sets​',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710903541/marketing/SG/menu%20banner/Bed_Sets_20032024_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bedroom Sets​',
          },
        ],
        disable: false,
      },
      {
        slug: 'storage',
        blocks: [
          {
            link: '/storage/new-in',
            title: 'New in',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1756453750/marketing/UK/Menu%20Banners/040925_S3_Storage_menu_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'New in',
          },
          {
            link: '/storage/tv-stands',
            title: 'TV Stands',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631578/marketing/UK/Menu%20Banners/TV_Stand_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'TV Stands',
          },
          {
            link: '/storage/shelving-units-bookcases',
            title: 'Shelving Units & Bookcases',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631582/marketing/UK/Menu%20Banners/Shelving_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Shelving Units & Bookcases',
          },
        ],
        disable: false,
      },
      {
        slug: 'furniture-sets',
        blocks: [
          {
            link: '/furniture-sets/living-room-sets',
            title: 'Living Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750758662/marketing/UK/Menu%20Banners/240625_UK_Living_FS_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Living Room Sets',
          },
          {
            link: '/furniture-sets/dining-room-sets',
            title: 'Dining Room Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750758666/marketing/UK/Menu%20Banners/240625_UK_Dining_FS_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room Sets',
          },
          {
            link: '/furniture-sets/bedroom-sets',
            title: 'Bedroom Sets',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1750758670/marketing/UK/Menu%20Banners/240625_UK_Bedroom_FS_MenuBanner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Bedroom Sets',
          },
        ],
        disable: false,
      },
      {
        slug: 'living-room',
        blocks: [
          {
            link: '/sofas/new-in',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1729563003/marketing/AU/menu/S4_1101_sofa_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa New In',
          },
          {
            link: '/bestselling-living-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197083/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Living-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Sofa Bestsellers',
          },
          {
            link: '/living-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197084/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Living-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Sale',
          },
        ],
        disable: false,
      },
      {
        slug: 'dining-room',
        blocks: [
          {
            link: '/bestselling-dining-room-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Tables Bestsellers',
          },
          {
            link: '/collections/vincent-collection',
            title: 'Vincent Collection',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Vincent-Collection.jpg',
            action_text: 'Shop Now',
            permalink: 'Vincent Collection',
          },
          {
            link: '/dining-room-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197186/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Dining-Room_Sale.jpg',
            action_text: 'Shop Now',
            permalink: 'Dining Room',
          },
        ],
        disable: false,
      },
      {
        slug: 'bedroom',
        blocks: [
          {
            link: '/products/adams-bed',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651197436/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Bedroom_New.jpg',
            action_text: 'Shop Now',
            permalink: 'New In',
          },
          {
            link: '/bestselling-bedroom-furniture',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651194445/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Beds_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/bedroom-sale',
            title: 'Sale',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198207/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Beds_Sale1.jpg',
            action_text: 'Shop Now',
            permalink: 'All Bedroom',
          },
        ],
        disable: false,
      },
      {
        slug: 'home-office',
        blocks: [
          {
            link: '/products/emmerson-adjustable-standing-desk',
            title: 'New In',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_New.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office',
          },
          {
            link: '/home-office-bestsellers',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_Bestsellers.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Bestsellers',
          },
          {
            link: '/home-office-shelves',
            title: 'Display Shelves',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1651198309/marketing/Cross-Market/menu%20banner/20220428_AUSG_Menu_Home-Office_Shelves.jpg',
            action_text: 'Shop Now',
            permalink: 'Home Office Shelves',
          },
        ],
        disable: false,
      },
      {
        slug: 'entryway',
        blocks: [
          {
            link: '/bestselling-storage',
            title: 'Bestsellers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646036665/marketing/Cross-Market/menu%20banner/Menu_Desktop_Bestseller_Storage.jpg',
            action_text: 'Shop Now',
            permalink: 'Bestsellers',
          },
          {
            link: '/entryway',
            title: 'Entryway',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646992110/marketing/Cross-Market/menu%20banner/Menu_Entryway_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Entryway',
          },
          {
            link: '/mid-century-modern-charmers',
            title: 'Mid-Century Modern Charmers',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1646038026/marketing/Cross-Market/menu%20banner/Menu_Desktop_MidCentryModern.jpg',
            action_text: 'Shop Now',
            permalink: 'Mid-Century Modern',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-tools',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631760/marketing/UK/Menu%20Banners/Tools_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631763/marketing/UK/Menu%20Banners/RoomDesigner_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Room Designer',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1763631767/marketing/UK/Menu%20Banners/Styleandtips_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1686122585/marketing/Cross-Market/menu%20banner/07062023_Menu_Desktop_STL.jpg',
            action_text: 'Shop Now',
            permalink: 'Shop The Look',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1559183887/marketing/AU/category/_Salebanner_EOFY2019_Desktop.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/family-friendly-homes',
            title: 'Family-Friendly Homes',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722221391/marketing/Cross-Market/menu%20banner/290724_Family-Friendly_Homes.jpg',
            action_text: '',
            permalink: '',
          },
        ],
        disable: false,
      },
      {
        slug: 'design-category',
        blocks: [
          {
            link: '/furniture-configurator-tool',
            title: 'Furniture Configurator Tool',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1710471820/marketing/Cross-Market/menu%20banner/FC_15032024_300x200.jpg',
            action_text: 'Shop Now',
            permalink: 'Furniture Configurator Tool',
          },
          {
            link: '/room-designer',
            title: 'Room Designer',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/room_designer_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/blog',
            title: 'Style and Furniture Tips',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1693467323/marketing/Cross-Market/menu%20banner/31082023_blog_v1_mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'Style and Furniture Tips',
          },
          {
            link: '/shop-the-look',
            title: 'Shop The Look',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1684402937/static/room-designer/shop_the_look_mobile.png',
            action_text: '',
            permalink: '',
          },
          {
            link: '/web-ar',
            title: 'At Home with You',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1559183887/marketing/AU/category/_Salebanner_EOFY2019_Mobile.jpg',
            action_text: 'Shop Now',
            permalink: 'sale',
          },
          {
            link: '/family-friendly-homes',
            title: 'Family-Friendly Homes',
            image_url:
              'https://res.cloudinary.com/castlery/image/upload/v1722221391/marketing/Cross-Market/menu%20banner/290724_Family-Friendly_Homes.jpg',
            action_text: 'Shop Now',
            permalink: '',
          },
        ],
        disable: false,
      },
    ],
    lastUpdated: '2025-12-10T10:03:13.648Z',
    note: 'Fallback data for UK outer-menu. Updated: 12/10/2025, 6:03:13 PM',
  },
};
