/* eslint-disable */
/**
 * Home Page Brand Refresh Fallback Data
 *
 * 这个文件由脚本自动生成，请勿手动编辑
 * 用于 getSpecificPage 方法的 fallback 数据
 * 参考 apps/web/scripts/update-basic-container-resource-fallback.ts 的逻辑
 *
 * @generated
 * @lastUpdated 2025-12-10T10:03:21.256Z
 */

interface FallbackData {
  value: any;
  lastUpdated: string;
  note: string;
}

/**
 * 各市场的 Home Page Brand Refresh 兜底数据
 * 当 Storyblok API 不可用时使用这些数据
 *
 * Edge Runtime 兼容：数据在编译时打包进 bundle
 *
 * 数据结构对应 getSpecificPage 方法的返回值
 */
export const FALLBACK_HOME_PAGE_BRAND_REFRESH_DATA: Record<string, FallbackData> = {
  sg: {
    value: {
      name: 'Home Page Brand Refresh',
      created_at: '2025-10-13T03:24:29.155Z',
      published_at: '2025-12-04T07:46:25.212Z',
      updated_at: '2025-12-04T07:46:25.255Z',
      id: 100910158492474,
      uuid: 'b01d67a6-38e4-4004-9c47-f022ecc3eab1',
      content: {
        _uid: '7d34bd87-9a3b-442c-9798-502a314a887d',
        body: [
          {
            _uid: '92079ad2-6bf9-4c52-94f2-9ab7a1259cfb',
            items: [
              {
                _uid: '317defa2-0916-4590-8c5f-a3721c8be9b7',
                size: 'large',
                image: [],
                video: [
                  {
                    _uid: '877625b6-7b5f-4a2b-a3de-102d2fc96be2',
                    mute: true,
                    autoplay: true,
                    controls: false,
                    component: 'video',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1764602847/marketing/SG/homepage/AUSG_HBP_25_Summer_Holiday_Campaign_Mobile.mp4',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1764602831/marketing/SG/homepage/AUSG_HBP_25_Summer_Holiday_Campaign_Desktop.mp4',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1764602831/marketing/SG/homepage/AUSG_HBP_25_Summer_Holiday_Campaign_Desktop.mp4',
                  },
                ],
                button: [
                  {
                    _uid: 'ddfed442-21fc-4a45-9396-166491ce52d5',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/sg/new',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/sg/new',
                    },
                    size: 'sm',
                    text: 'Discover our designs',
                    color: '#F6F3E7',
                    variant: 'secondary',
                    component: 'button',
                    text_color: '#F6F3E7',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gets better with living',
                bg_color: '',
                component: 'full-width-banner',
                sub_header: '',
                text_align: 'center',
                anchor_link: '',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                    },
                  ],
                },
                header_color: '',
                header_level: 'h1',
                enlarge_header: true,
                sub_header_color: '',
                sub_header_level: 'subh1',
                klaviyo_signup_form: [],
                banner_selector_name: 'HP Banner',
              },
            ],
            component: 'Hero',
          },
          {
            _uid: '098214e5-63ef-48fe-9080-34e369a685a1',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Every festive detail finds its place when your space is perfectly set for the season. Explore designs that bring just the right touch of sparkle—and get your home styled for the holidays.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#834024',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '86ce1582-c6fb-4d62-a0cc-ee3eaa05dfa1',
                image: [
                  {
                    alt: 'A leather sofa and a performance bouclé armchair placed in a living room.',
                    _uid: '639928c1-ab6d-4b37-b283-e4c91174b460',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/1_Sofa.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/1_Sofa.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/1_Sofa.png',
                  },
                ],
                button: [
                  {
                    _uid: '264402c9-a63f-41df-9a5c-02e9fc08281e',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/sg/sofas/all-sofas',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/sg/sofas/all-sofas',
                    },
                    size: 'sm',
                    text: 'Shop sofas',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Get together in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'c9b418f4-0d78-4be7-aebe-b3b4cd5b0e05',
                image: [
                  {
                    alt: 'A wooden bed with a wingback headboard placed in the bedroom.',
                    _uid: 'a98b6480-42b9-46f5-88fc-c691bd41826b',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/2_Bed.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/2_Bed.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/2_Bed.png',
                  },
                ],
                button: [
                  {
                    _uid: '1e4878c0-3183-4bb7-a478-29abf4cebc0e',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/sg/beds/all-bedroom',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/sg/beds/all-bedroom',
                    },
                    size: 'sm',
                    text: 'Shop Beds',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Rest easy in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '16b3c591-22e8-4f29-97c5-4c883d36feac',
                image: [
                  {
                    alt: 'A 6-drawer dark wood dresser with brass handles.',
                    _uid: 'f9fd7996-4be5-406a-b084-01638735fc3f',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/3_Storage.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/3_Storage.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686751/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/3_Storage.png',
                  },
                ],
                button: [
                  {
                    _uid: '596f498e-227c-4ec4-8657-0c363962f580',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/sg/storage/all-storage',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/sg/storage/all-storage',
                    },
                    size: 'sm',
                    text: 'Shop Storage',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Declutter in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'f816c0ba-d9a2-47ec-9730-79ca8d6decc6',
                image: [
                  {
                    alt: 'A cream-coloured sofa placed against a wall with two artwork hanging above it.',
                    _uid: 'aaa3a727-cef1-4746-bd4b-48871fe7a3fc',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686745/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/4_Compact.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686745/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/4_Compact.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686745/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/SG/4_Compact.png',
                  },
                ],
                button: [
                  {
                    _uid: 'c34ed4f6-db59-44b6-8a22-4c8952957b0e',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/sg/small-space-and-apartment-furniture',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/sg/small-space-and-apartment-furniture',
                    },
                    size: 'sm',
                    text: 'Shop Castlery Compact',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Make room in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
            ],
            button: [
              {
                _uid: '23a5e178-8c50-4b84-8c0a-214e3cd2f894',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/sg/all-products',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/sg/all-products',
                },
                size: 'sm',
                text: 'Shop now',
                color: '',
                variant: 'secondary',
                component: 'button',
                text_color: '',
                estate_name: '',
                end_decorator: '',
                tracking_label: '',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header: '',
            component: 'Hover Listing V2',
            direction: 'vertical',
            background: '#F6F3E7',
            header_color: '',
            header_level: 'h2',
            hover_status: true,
            header_position: 'left',
          },
          {
            _uid: '7b94512d-6eb3-499d-862d-cfffb101e903',
            link: [],
            image: [],
            button: [
              {
                _uid: '82dbb309-6a6a-4cf8-84d9-b37bb57de4ab',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/sg/shop-the-look/living-room',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/sg/shop-the-look/living-room',
                },
                size: 'sm',
                text: 'View all',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                end_decorator: '',
                klaviyo_form_id: '',
                start_decorator: '',
              },
            ],
            header: 'Shop the look',
            component: 'Link Banner',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Thoughtfully made by people who live in homes, too. That’s why you love them so much.​',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h1',
            background_color: '#3C101E',
          },
          {
            _uid: 'adc81c73-8602-4941-be20-deed4df42f66',
            items: [
              {
                _uid: 'ee8a736c-fcf7-4202-98eb-481324c8c745',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686949/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_6.png',
                hotspots: [
                  {
                    x: '15',
                    y: '12',
                    _uid: '0a4f39a4-8a4f-4735-96f2-8f808a6f4c80',
                    name: 'Solari',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34934',
                  },
                  {
                    x: '3',
                    y: '13',
                    _uid: 'd6b51043-2cd7-4914-a526-62d2e40fadd8',
                    name: 'Fable',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '34921',
                  },
                  {
                    x: '7',
                    y: '13',
                    _uid: 'f4932a60-246a-4626-9a1c-edae55d81966',
                    name: 'Elio side',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32675',
                  },
                  {
                    x: '13',
                    y: '18',
                    _uid: '7f88ecaf-25c5-49c8-811f-22b298440455',
                    name: 'Elio coffee',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32673',
                  },
                  {
                    x: '10',
                    y: '3',
                    _uid: '60878ecb-b854-4018-a81d-1587d50805bb',
                    name: 'Arcadia',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '35292',
                  },
                  {
                    x: '8',
                    y: '19',
                    _uid: '766d7dc0-d8ca-4a3e-abe0-8d0b7661b73b',
                    name: 'Claudia rug',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '35029',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Solari',
              },
              {
                _uid: '808e893b-5fb7-4bb3-a4d5-4b20c6db8c3f',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686927/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_5.png',
                hotspots: [
                  {
                    x: '11',
                    y: '6',
                    _uid: '0e628735-2146-4ed0-907e-f4a89d6e70d2',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '34895',
                  },
                  {
                    x: '5',
                    y: '15',
                    _uid: '5a73b187-5a68-45cb-8766-4b976787b671',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '33295',
                  },
                  {
                    x: '8',
                    y: '13',
                    _uid: '0bbcb2ca-983b-4183-8279-ee1481c94293',
                    name: 'Sloane Cane Chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27341',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper Dining',
              },
              {
                _uid: '4242ee02-73b4-4722-9952-06a5f06e0e72',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686935/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_7.png',
                hotspots: [
                  {
                    x: '10',
                    y: '7',
                    _uid: '835b1e02-e7c0-42ad-9fae-2c57e3d53fa4',
                    name: 'Harper bed',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34888',
                  },
                  {
                    x: '14',
                    y: '10',
                    _uid: 'e4d8e08c-2a3c-443d-8528-77ffff26769f',
                    name: 'Seb Marble Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34691',
                  },
                  {
                    x: '3',
                    y: '10',
                    _uid: '18e96769-a8dd-4fa2-b101-fee992df2df0',
                    name: 'Harper 6-drawer dresser',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34755',
                  },
                  {
                    x: '10',
                    y: '17',
                    _uid: 'f54d744c-1a05-4cc4-bce8-d41df111cc28',
                    name: 'Nola Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34868',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper bed',
              },
              {
                _uid: '40140bce-b9e4-4736-b389-2450501c73cd',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686952/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_4.png',
                hotspots: [
                  {
                    x: '11',
                    y: '8',
                    _uid: 'cbca670b-51fc-46a8-b8d2-0f3c9de01485',
                    name: 'Agnes Sofa',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '36446',
                  },
                  {
                    x: '2',
                    y: '13',
                    _uid: '9fd675f4-8d51-4cae-93f6-82af19bbd22a',
                    name: 'Agnes Ottoman',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '36476',
                  },
                  {
                    x: '17',
                    y: '10',
                    _uid: 'd830bab8-6e15-4752-8871-57d3c40125ac',
                    name: 'Arcadia Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34904',
                  },
                  {
                    x: '3',
                    y: '6',
                    _uid: '6017f3af-41fb-48df-bb5d-517cdef05255',
                    name: 'Anya Dining Chair',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '36123',
                  },
                  {
                    x: '18',
                    y: '3',
                    _uid: 'a10513ee-7559-4afb-8f8c-6862acb8f876',
                    name: 'Blanc Arched Table Lamp',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '31465',
                  },
                  {
                    x: '11',
                    y: '18',
                    _uid: '80a96879-dad0-4456-9443-95a82609d270',
                    name: 'Claudia Area Rug',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '34871',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Agnes Sofa',
              },
              {
                _uid: '83e4b6bb-72cf-45a1-8657-6cf3eaefddb4',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686925/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_3.png',
                hotspots: [
                  {
                    x: '10',
                    y: '8',
                    _uid: '674961bf-79b8-424d-9698-d7369cb84082',
                    name: 'Belmont',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '35967',
                  },
                  {
                    x: '4',
                    y: '12',
                    _uid: '682d5a76-772d-4439-8e5b-6791591d0f72',
                    name: 'Lira',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '36261',
                  },
                  {
                    x: '11',
                    y: '6',
                    _uid: '029ea2eb-bfad-4eb4-a400-d4d6daccff07',
                    name: 'Cascade',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '35545',
                  },
                  {
                    x: '9',
                    y: '6',
                    _uid: '38c409e1-eba7-44b6-8635-9fbd243c4e5b',
                    name: 'Audrey',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32572',
                  },
                  {
                    x: '12',
                    y: '7',
                    _uid: '860cc931-5e0b-400a-a84e-41f18f4e11ef',
                    name: 'Renoir',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '33235',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Belmont Round Dining Table',
              },
              {
                _uid: 'd444c0ac-3047-4e6c-855e-9a06a0a9345d',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686958/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_8.png',
                hotspots: [
                  {
                    x: '7',
                    y: '12',
                    _uid: '44ed5278-3dbd-4ffc-b689-0508713693b7',
                    name: 'Jaron',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '34995',
                  },
                  {
                    x: '18',
                    y: '6',
                    _uid: '8d440fb3-e970-4a59-8d41-0723768d2222',
                    name: 'Arcadia Large Hutch',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '34895',
                  },
                  {
                    x: '18',
                    y: '12',
                    _uid: '118dab3a-61e0-4ed1-9fb8-8333d1d8c539',
                    name: 'Arcadia Large Sideboard',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '34893',
                  },
                  {
                    x: '10',
                    y: '13',
                    _uid: 'df9c189f-c35c-476c-9424-f07079aa7044',
                    name: 'Elio Coffee Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32673',
                  },
                  {
                    x: '9',
                    y: '12',
                    _uid: 'adea4be4-08ab-445f-be7b-c326f4e9f3e4',
                    name: 'Elio Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32675',
                  },
                  {
                    x: '12',
                    y: '16',
                    _uid: '2296b357-03d6-4f9f-98e6-ec4356fb5e14',
                    name: 'Duncan Round Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32648',
                  },
                  {
                    x: '15',
                    y: '14',
                    _uid: '8be4732a-d571-494d-b9dc-66ba9f93caf9',
                    name: 'Wayne Armchair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25667',
                  },
                  {
                    x: '7',
                    y: '17',
                    _uid: '423a26ce-6e59-49f6-aca4-7cc6cfda154a',
                    name: 'Muna Area Rug',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '33667',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Jaron Leather Sofa',
              },
              {
                _uid: '4b8ce472-4464-4f97-873f-e82cf2c9158f',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686943/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_2.png',
                hotspots: [
                  {
                    x: '11',
                    y: '8',
                    _uid: 'c33ff5df-16e2-4c93-bf54-e2c91bec9fe6',
                    name: 'Dawson Sofa',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '32044',
                  },
                  {
                    x: '7',
                    y: '13',
                    _uid: 'a38d04a0-54cb-4b60-86b8-969b6e7d4a6e',
                    name: 'Casa Rectangular Box CT',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27899',
                  },
                  {
                    x: '2',
                    y: '10',
                    _uid: 'de958fe2-0e77-4273-b607-0186b608c1c4',
                    name: 'Dawson Storage Ottoman',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '36310',
                  },
                  {
                    x: '17',
                    y: '11',
                    _uid: 'e2de50ca-48dd-4e38-a810-acc00e54057d',
                    name: 'Seb Side Table',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '33482',
                  },
                  {
                    x: '13',
                    y: '4',
                    _uid: '85c25bb2-d24a-4eba-b747-1d96e458118b',
                    name: 'Nadine Wall Mirror',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '33613',
                  },
                  {
                    x: '13',
                    y: '16',
                    _uid: '6e83dfa2-d27a-44d3-b9d0-7adb80cc1cfd',
                    name: 'Cora Wool Area Rug',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '32893',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Dawson Sofa',
              },
              {
                _uid: 'c83cc835-9daa-4747-b1fc-2b181e3442d7',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760512135/marketing/US/Shop%20The%20Look/US_HP_Holiday25_STL_Auburn_curve_sofa.jpg',
                hotspots: [
                  {
                    x: '7',
                    y: '9',
                    _uid: '1462fbfb-701a-423b-a9ba-45edddd9e05b',
                    name: 'Auburn',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27944',
                  },
                  {
                    x: '12',
                    y: '11',
                    _uid: '94e32906-e85d-4397-8778-78559b9f68c0',
                    name: 'Hugg',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34615',
                  },
                  {
                    x: '2',
                    y: '13',
                    _uid: 'e6cd870e-bf45-45f9-bc4d-ef0c11b179c1',
                    name: 'Guin',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '32640',
                  },
                  {
                    x: '18',
                    y: '9',
                    _uid: '46c3ff59-b998-4c7e-9e5e-aa163e69ee3c',
                    name: 'Bradley',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '32627',
                  },
                  {
                    x: '6',
                    y: '16',
                    _uid: '55b4b529-5e57-41bb-92a0-9ebbbb9b15a3',
                    name: 'Monet Area Rug',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '32871',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Auburn',
              },
              {
                _uid: '9376c34d-2247-46b6-8eb9-2bafddbf026b',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760512190/marketing/US/Shop%20The%20Look/US_HP_Holiday25_STL_Brighton_dining.jpg',
                hotspots: [
                  {
                    x: '10',
                    y: '8',
                    _uid: 'a600edf5-c802-4f28-b32a-860782fba009',
                    name: 'Brighton Dining Table​',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25587',
                  },
                  {
                    x: '6',
                    y: '3',
                    _uid: '5f0c26fd-f3c2-4dc1-8023-0d0e02b80b9a',
                    name: 'Lily sideboard',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '15432',
                  },
                  {
                    x: '13',
                    y: '9',
                    _uid: 'a6ce935a-c4c2-47b7-9fa3-67848b6a44cd',
                    name: 'Seb Fabric Chair',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '36066',
                  },
                  {
                    x: '3',
                    y: '15',
                    _uid: '621243c5-d57f-4894-a7d0-b3c609b53d81',
                    name: 'Cedric Table Lamp',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '34706',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Brighton',
              },
              {
                _uid: '0da11de6-8c81-4d22-8c30-e544e7f335d5',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760512228/marketing/US/Shop%20The%20Look/US_HP_Holiday25_STL_Dalton_bed.jpg',
                hotspots: [
                  {
                    x: '10',
                    y: '11',
                    _uid: 'ace7d321-e392-4092-b058-3cd1eecdbd9d',
                    name: 'Dalton bed',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26709',
                  },
                  {
                    x: '17',
                    y: '16',
                    _uid: '0d2a5350-b007-4508-8e37-e3da609a75ce',
                    name: 'Sloane bedside table',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '36250',
                  },
                  {
                    x: '9',
                    y: '5',
                    _uid: '7420764c-6dbb-4f65-83d6-52cba98eafbd',
                    name: 'Haylen',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '34650',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Dalton',
              },
            ],
            component: 'Shop The Look List',
            show_view_all_products: false,
          },
          {
            _uid: 'a2e9ff83-cc71-4b7e-8b40-f4472f8edca8',
            component: 'Recommendation Carousel',
            selector_name: 'HP Recommendation #1',
          },
          {
            _uid: '12d77bf9-dea4-4d2e-b03f-034a250be9c9',
            link: [
              {
                url: 'https://www.castlery.com/sg/press',
                _uid: '7ab81af0-076e-4ddb-881b-ae9ad6ff4b80',
                text: 'Go Press',
                component: 'Link V2',
                text_color: '#fff',
              },
            ],
            image: [
              {
                alt: '',
                _uid: 'edef0b93-d999-4beb-80a5-dee1461a8132',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507443/NEW%20Homepage/SG%20Press/SG_Press_v2_Mobile.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507443/NEW%20Homepage/SG%20Press/SG_Press_v2_Desktop.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507443/NEW%20Homepage/SG%20Press/SG_Press_v2_Desktop.png',
              },
            ],
            button: [],
            header: '',
            component: 'Link Banner',
            whole_link: true,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '',
            header_level: 'h2',
            background_color: '',
          },
          {
            _uid: 'c06d1f61-772a-47fa-adea-f2152347b1c1',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'See our designs in real homes ',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#3C101E',
                          },
                        },
                      ],
                    },
                    {
                      text: '@castlerysg',
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://www.instagram.com/castlerysg?igsh=MWw5dXVqZ24xbHR6MQ==',
                            uuid: null,
                            anchor: null,
                            target: '_self',
                            linktype: 'url',
                          },
                        },
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#A45B37',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '558d680f-7aa0-40f7-9fd1-ddc87fa2f570',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castlerysg/p/DPqs6McD0B2/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castlerysg/p/DPqs6McD0B2/',
                },
                image: [
                  {
                    alt: 'A performance bouclé chaise sectional sofa placed in front of a TV mounted to the wall.',
                    _uid: '722d59c5-c2a8-448a-8d57-c4e9dbfe96de',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718656/marketing/SG/Social%20UGCs/SG_UGC_1.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718656/marketing/SG/Social%20UGCs/SG_UGC_1.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718656/marketing/SG/Social%20UGCs/SG_UGC_1.jpg',
                  },
                ],
                video: [],
                content:
                  "The feeling when you know the house is about to be full of people - Marlow's soft bouclé curves creates an instant gossip circle you'd never want to leave. @leinterioraffairs's clever styling created a space made for movie marathons, messy board games, and all the weekend laughter in between.\n\nIn the spotlight: Marlow Performance Bouclé Chaise Sectional Sofa, Guin Round Coffee Table\nPhotography: @leinterioraffairs\n#castlerytrade",
                creator: '@leinterioraffairs',
                component: 'ugc-listing',
                product_list: '27422',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'd792aa4a-6ea5-4f95-a36b-f688d79106bf',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castlerysg/p/DPoL5vqDcY0/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castlerysg/p/DPoL5vqDcY0/',
                },
                image: [
                  {
                    alt: 'A child holding a toy bunny sitting on a large swivel armchair.',
                    _uid: 'dcaa575e-6f9e-468e-81ef-feaf726aa1ff',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718987/marketing/SG/Social%20UGCs/SG_UGC_2.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718987/marketing/SG/Social%20UGCs/SG_UGC_2.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761718987/marketing/SG/Social%20UGCs/SG_UGC_2.jpg',
                  },
                ],
                video: [],
                content:
                  'From storytime spins to snacktime snuggles—Hamilton makes every little moment a little easier (and a lot more comfortable). Soft curves and a seat made for staying close.\n\nIn the spotlight: Hamilton Round Performance Fabric Swivel Armchair\nPhotography: @ourviennaliving',
                creator: '@ourviennaliving',
                component: 'ugc-listing',
                product_list: '36410',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '51b368b0-b317-49ce-849c-0f826fe25824',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castlerysg/p/DMUA6HJuXfj/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castlerysg/p/DMUA6HJuXfj/',
                },
                image: [
                  {
                    alt: 'A woman playing with her child while seated on a performance fabric 3-seater sofa.',
                    _uid: 'acfaae8b-067c-425b-8476-da7caa3f2347',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719384/marketing/SG/Social%20UGCs/SG_UGC_3.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719384/marketing/SG/Social%20UGCs/SG_UGC_3.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719384/marketing/SG/Social%20UGCs/SG_UGC_3.jpg',
                  },
                ],
                video: [],
                content:
                  'Soft enough for naps. Roomy enough for storytime. With feather-filled cushions and a grounding low-slung frame, Mori’s the kind of sofa that makes Sunday resets feel like a ritual.\n\nIn the spotlight: Mori Performance Fabric 3 Seater Sofa\nPhotography: @winnie.loves',
                creator: '@winnie.loves',
                component: 'ugc-listing',
                product_list: '31936',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '41373e0b-1ac7-40a0-b621-03976cf0d3cd',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DK9qvRZxXX4/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DK9qvRZxXX4/',
                },
                image: [
                  {
                    alt: 'An acacia wood dining table with 6 matching acacia wood dining chairs.',
                    _uid: 'ae9ec5e9-d4ac-44e5-bdb1-6fb76aab99b1',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719675/marketing/SG/Social%20UGCs/SG_UGC_4.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719675/marketing/SG/Social%20UGCs/SG_UGC_4.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719675/marketing/SG/Social%20UGCs/SG_UGC_4.jpg',
                  },
                ],
                video: [],
                content:
                  'Same table, different homes. Seb’s not just for mealtimes—it’s for late-night chats, surprise dinner parties, kid-made masterpieces and everything in between. With warm wood tones, Seb makes every home feel a little more like home.\n\nIn the spotlight: Seb Dining Table\nPhotography: @ktbunton, @wethejays, @izzaturrusyda',
                creator: '@ktbunton',
                component: 'ugc-listing',
                product_list: '3053',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'e43909f7-e83e-477e-bb20-5f100001fe30',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castlerysg/p/DMB_HmCxN4y/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castlerysg/p/DMB_HmCxN4y/',
                },
                image: [
                  {
                    alt: 'Two dogs laying down on a bed. ',
                    _uid: 'd6c35578-1486-4f2f-a3f5-5ea64f269cea',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719826/marketing/SG/Social%20UGCs/SG_UGC_5.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719826/marketing/SG/Social%20UGCs/SG_UGC_5.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719826/marketing/SG/Social%20UGCs/SG_UGC_5.jpg',
                  },
                ],
                video: [],
                content:
                  'Sunday sleep-ins, but shared with two snorers. Dalton keeps it paw print-friendly and clutter-free to make space. You’ll never want to leave (and neither will they).\n\nIn the spotlight: Dawson Storage Bed\nPhotography: @ayceandaria',
                creator: '@ayceandaria',
                component: 'ugc-listing',
                product_list: '32926',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '00246296-333c-443c-9b96-801132c2c9cc',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castlerysg/p/DMRzrs4u6sD/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castlerysg/p/DMRzrs4u6sD/',
                },
                image: [
                  {
                    alt: 'A family of four playing around a performance bouclé l-shape sectional sofa.',
                    _uid: '71efb8a7-f4f0-4ad2-9750-806a884a1ac9',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719968/marketing/SG/Social%20UGCs/SG_UGC_6.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719968/marketing/SG/Social%20UGCs/SG_UGC_6.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761719968/marketing/SG/Social%20UGCs/SG_UGC_6.jpg',
                  },
                ],
                video: [],
                content:
                  'Spills? Handled. Cartwheels? Sure. Marlow’s soft curves and performance bouclé make it the comfy, wipeable centrepiece your living room (and family) deserves.\n\nIn the spotlight: Marlow Performance Bouclé L-Shape Sectional Sofa, Guin Round Coffee Table \nPhotography: @shuls.hua',
                creator: '@shuls.hua',
                component: 'ugc-listing',
                product_list: '27421',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            header: '#AtHomewithCastlery',
            component: 'Social UGC',
            header_color: '#3C101E',
            nums_in_line: '6',
            background_color: '#F6F3E7',
            navigation_display: true,
          },
          {
            _uid: '0f43524d-b385-4152-bd6a-8d160c55f1bb',
            size: 'medium',
            image: [
              {
                alt: 'A group of people sitting around a dining table lined with food while clinking their glasses.',
                _uid: 'd455df6f-7b90-4cf4-b6c0-e56f46327738',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Mobile-780x1200.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
              },
            ],
            video: [],
            button: [
              {
                _uid: '9a390e34-198c-4141-b410-eaef30346337',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/sg/our-story',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/sg/our-story',
                },
                size: 'sm',
                text: 'Read our story',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                estate_name: '',
                end_decorator: '',
                tracking_label: '',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header:
              'A good piece of furniture opens your eyes to the spaces you already have, and all the life that’s waiting to be lived in them.',
            bg_color: '',
            component: 'full-width-banner',
            sub_header: '',
            text_align: 'center',
            anchor_link: '',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            enlarge_header: false,
            sub_header_color: '#F6F3E7',
            sub_header_level: 'subh1',
            klaviyo_signup_form: [],
            banner_selector_name: '',
          },
          {
            _uid: '82381647-d7f6-4858-a5a5-8161c6243264',
            items: [
              {
                _uid: '83f5fd3c-8555-413c-9520-6e7608717735',
                image: [],
                video: [],
                header: 'Who are we?',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Born in Singapore in 2013, we design furniture that lives with you—and gets better with time.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'We obsess over the details most people overlook: the warmth of real teak, the cool elegance of marble, the curve of a chair that just feels right. Every piece is made to last, not just in form but in feeling—functional, timeless, and ready to grow with you through life’s messes, milestones, and everything in between.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Learn more about us',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/our-story',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' or better yet, ',
                          type: 'text',
                        },
                        {
                          text: 'see why our customers love our home furniture',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/reviews',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '2c271018-61da-4db5-a294-b91fdfa9fcfd',
                image: [],
                video: [],
                header: 'What types of modern furniture can you find here? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Explore our range of thoughtfully designed furniture for every room in your home.',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Living room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/sg/furniture-sets/living-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Our sofas, armchairs, coffee tables, and storage pieces are made for lounging, gathering, and stealing the spotlight—without shouting for it.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Bedroom furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/sg/furniture-sets/bedroom-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': From sturdy bed frames to sleek bedside tables and dressers, our bedroom pieces are crafted for comfort and calm.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Outdoor & patio furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/sg/furniture-sets/outdoor-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Built with weather-resistant materials and timeless appeal, our outdoor collection is made to handle the elements—and the impromptu BBQ.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Dining room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/sg/furniture-sets/dining-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Tables that host; Chairs that stay comfortable through dessert. Our dining table sets are functional, elegant, and built for everything from weeknight takeout to celebratory spreads.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Home accessories',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/sg/accessories/all-accessories',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Rugs, mirrors, lighting, and more—our accessories are the finishing touches that pull it all together. Consider them your space’s secret sauce.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: ' ',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For a fuss-free online shopping experience, we’ve curated ',
                          type: 'text',
                        },
                        {
                          text: 'furniture bundles',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/sale/bundle-sale',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' just for you. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'With just a click, get matching furniture sets for any space in your home.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#323433',
                seo_description: '',
              },
              {
                _uid: '10be8daa-5b07-4c0f-89c0-16e4e5ba78cb',
                image: [],
                video: [],
                header: 'I need help designing & styling my home – is there a tool that I can use? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'With ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery’s Room Designer Tool',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/room-designer',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ', you can plan your furniture layout, mix and match pieces, and see exactly how everything fits—before you buy. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'It’s the easiest way to design a functional, beautiful space that works for real life.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Looking for ideas? Get inspired by the latest home decor trends, styling tips, and design guides on the ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery Blog',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/blog',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'From material deep-dives to space-saving tricks, it’s your go-to for creating a home that feels like you.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#323433',
                seo_description: '',
              },
              {
                _uid: 'bd8006aa-10b4-4d79-a437-6fbfb64ef1b0',
                image: [],
                video: [],
                header: 'Need help with shipping, delivery, and warranties? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'We strive to make your Castlery experience seamless—from browsing and checkout to delivery and everyday living. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Here are some perks when you shop with us:',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy free shipping when your order is over $300.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'We offer three types of delivery options – Standard, Room of Choice, or White Glove.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy 30-day easy returns.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For more details on orders, shipping, returns, or product care, head over to our ',
                          type: 'text',
                        },
                        {
                          text: 'Help Center',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/sg/help-center',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Because bringing beautiful furniture home should feel as good as it looks.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#323433',
                seo_description: '',
              },
            ],
            header: 'Shop Online Furniture Store with Modern Designs',
            component: 'Accordion',
            header_color: '#3C101E',
            has_faq_schema: false,
            background_color: '#F6F3E7',
          },
          {
            _uid: 'f47b0f19-70f6-49e1-92fa-c8d7f3f670e5',
            size: 'medium',
            component: 'section-break',
          },
        ],
        meta: [
          {
            _uid: '3905fdb4-8132-474d-b227-6d58664dcb4e',
            title: 'Modern Furniture Store Online',
            keywords:
              'furniture Singapore, online furniture Singapore, furniture shop Singapore, furniture stores Singapore, furniture in Singapore, modern furniture Singapore, furniture SG, furniture, Castlery, Singapore',
            component: 'meta-data',
            description:
              'Shop our homegrown Singapore furniture store online or in our showroom for modern sofas, tables, beds & more. Enjoy 30-day easy returns.',
            notIndexable: true,
            structure_data:
              '{"@context": "http://schema.org","@type": "WebSite","url": "https://www.castlery.com/sg/","name": "Castlery","potentialAction": {"@type": "SearchAction","target": "https://www.castlery.com/sg/search?q={search_term_string}","query-input": "required name=search_term_string"}}',
          },
        ],
        timer: [],
        component: 'page',
        breadcrumb: '',
        redirect_url: '',
      },
      slug: 'home-page-brand-refresh',
      full_slug: 'sg/general-content-v2/main-pages/home-page-brand-refresh',
      sort_by_date: null,
      position: -620,
      tag_list: [],
      is_startpage: false,
      parent_id: 77282840239053,
      meta_data: null,
      group_id: 'cef4dec1-5754-40ab-912a-1494f3a05357',
      first_published_at: '2025-10-13T09:39:43.706Z',
      release_id: null,
      lang: 'default',
      path: 'sg',
      alternates: [],
      default_full_slug: null,
      translated_slugs: null,
    },
    lastUpdated: '2025-12-10T10:03:17.251Z',
    note: 'Fallback data for SG home-page-brand-refresh. Updated: 12/10/2025, 6:03:17 PM',
  },
  us: {
    value: {
      name: 'Home Page Brand Refresh',
      created_at: '2025-09-15T08:15:05.165Z',
      published_at: '2025-12-08T08:34:34.862Z',
      updated_at: '2025-12-08T08:34:34.988Z',
      id: 91072533191199,
      uuid: 'f67bfdce-0301-4f99-af10-aa5d75c41fed',
      content: {
        _uid: '4dafc377-36e8-474e-b581-7750cf3ed7fb',
        body: [
          {
            _uid: '0a36bd58-a1b2-49c5-b89f-22db2bf21d30',
            items: [
              {
                _uid: 'd481e8f6-c52b-419f-8321-6fb87ec960a8',
                size: 'large',
                image: [],
                video: [
                  {
                    _uid: '65b12705-f164-4fe0-b7d7-34e0a25eb474',
                    mute: true,
                    autoplay: true,
                    controls: false,
                    component: 'video',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683580/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_MOBILE.mp4',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                  },
                ],
                button: [
                  {
                    _uid: '47a653aa-ce8b-4dcf-8689-0cd217de1581',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/us/new',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/us/new',
                    },
                    size: 'sm',
                    text: 'Discover our designs',
                    color: '#F6F3E7',
                    variant: 'secondary',
                    component: 'button',
                    text_color: '#F6F3E7',
                    end_decorator: '',
                    tracking_label: 'hp-hero-s3',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gets better with living',
                bg_color: '#F6F3E7',
                component: 'full-width-banner',
                sub_header: '',
                text_align: 'center',
                anchor_link: '',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                    },
                  ],
                },
                header_color: '#F6F3E7',
                header_level: 'h1',
                enlarge_header: true,
                sub_header_color: '#F6F3E7',
                sub_header_level: '',
                klaviyo_signup_form: [],
                banner_selector_name: 'HP Banner',
              },
            ],
            component: 'Hero',
          },
          {
            _uid: 'e2d24a3c-11b2-4a22-969b-a348aaf1f8ad',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Every festive detail finds its place when your space is perfectly set for the season. Explore designs that bring just the right touch of sparkle—and get your home styled for the holidays.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#834024',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '0a2e95e8-9baf-47ba-9251-8e36e4424acd',
                image: [
                  {
                    alt: 'A brown sofa and coffee table with Christmas Decor in a living room.',
                    _uid: 'b1dc7d2d-8e67-44bc-a7a8-192e20b46115',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/3_JonathanSofa.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/3_JonathanSofa.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/3_JonathanSofa.png',
                  },
                ],
                button: [
                  {
                    _uid: '1818b38d-3c0c-4e4b-a9f0-c9a2c1f57cff',
                    link: {
                      id: '',
                      url: 'us/sofas/all-sofas',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'us/sofas/all-sofas',
                    },
                    size: '',
                    text: 'Shop Sofas',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-living-bundle',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Get together in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'be83e1fa-70a1-4395-877f-00d5fa00fa28',
                image: [
                  {
                    alt: 'A storage bed with a fully upholstered fabric bed frame placed atop a rug in a bedroom.',
                    _uid: '9d546f80-b77e-4964-a834-5967e0c275f1',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/1_daltonstoragebed.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/1_daltonstoragebed.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/1_daltonstoragebed.png',
                  },
                ],
                button: [
                  {
                    _uid: 'e7dd1793-3131-4d05-b9b7-00a06151b07e',
                    link: {
                      id: '',
                      url: 'us/beds/all-bedroom',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'us/beds/all-bedroom',
                    },
                    size: '',
                    text: 'Shop beds',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-bedroom',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Rest easy in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'b9ec0d51-9814-4084-ab4d-9ff7c788169c',
                image: [
                  {
                    alt: 'A 4-tier dark wood shelf with books, potted plants, frames, candles and Christmas decor on top.',
                    _uid: 'bfef2d0a-f23b-4926-a028-7265dd705f5c',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181491/marketing/US/Secondary%20Widget/2_SloaneShelf.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181491/marketing/US/Secondary%20Widget/2_SloaneShelf.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181491/marketing/US/Secondary%20Widget/2_SloaneShelf.png',
                  },
                ],
                button: [
                  {
                    _uid: '274f2cac-d788-40c4-abf8-85c3fe7e8ad0',
                    link: {
                      id: '',
                      url: 'us/storage/all-storage',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'us/storage/all-storage',
                    },
                    size: '',
                    text: 'Shop storage',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-living-bundle',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Declutter in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '9220ea48-c843-4c39-bee5-6ea3664138c5',
                image: [
                  {
                    alt: 'A wooden coffee table with a rounded edge and performance fabric seats placed in a living room surrounded by Christmas decor..',
                    _uid: '9e66c410-18b7-49c4-b154-3f233e5e1c06',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/4_huggcoffeetable.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/4_huggcoffeetable.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765181490/marketing/US/Secondary%20Widget/4_huggcoffeetable.png',
                  },
                ],
                button: [
                  {
                    _uid: '527a748f-6d32-45e6-bddb-4ae8893f2950',
                    link: {
                      id: '',
                      url: 'us/tables/all-tables',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'us/tables/all-tables',
                    },
                    size: '',
                    text: 'Shop tables',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-dining',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gather round in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
            ],
            button: [
              {
                _uid: 'eda28a29-ced6-4c50-8972-d3fd4031671f',
                link: {
                  id: '',
                  url: 'us/all-products',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'us/all-products',
                },
                size: '',
                text: 'Shop now',
                color: '',
                variant: 'secondary',
                component: 'button',
                text_color: '',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-all-products',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header: '',
            component: 'Hover Listing V2',
            direction: 'vertical',
            background: '#F6F3E7',
            header_color: '#3C101E',
            header_level: 'h2',
            hover_status: true,
            header_position: 'left',
          },
          {
            _uid: '58ba0816-3a03-4b7c-9522-617ca7031bfa',
            link: [],
            image: [],
            button: [
              {
                _uid: '774281fa-f2d6-4722-ae3c-dde53992a07d',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/us/shop-the-look/living-room',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/us/shop-the-look/living-room',
                },
                size: 'sm',
                text: 'View all',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                end_decorator: '',
                tracking_label: 'hp-shop-the-look',
                klaviyo_form_id: '',
                start_decorator: '',
              },
            ],
            header: 'Shop the look',
            component: 'Link Banner',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Thoughtfully made by people who live in homes, too. That’s why you love them so much.​',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            background_color: '#3C101E',
          },
          {
            _uid: '4bfd8143-d15d-4203-b212-3d3dd25f7bb7',
            items: [
              {
                _uid: 'c7a35cd0-2d2b-43a6-a1ca-3251abed81c0',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686949/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_6.png',
                hotspots: [
                  {
                    x: '16',
                    y: '12',
                    _uid: '35b8a5ef-acf3-49e9-90bb-1b4e31081bb5',
                    name: 'Solari',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26537',
                  },
                  {
                    x: '3',
                    y: '13',
                    _uid: '52892bd9-8431-4f29-83b5-a8fccb2ba631',
                    name: 'Fable',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25883',
                  },
                  {
                    x: '8',
                    y: '14',
                    _uid: '919007b2-8ee1-46f9-99db-72ddf3d438d7',
                    name: 'Elio side',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23091',
                  },
                  {
                    x: '15',
                    y: '18',
                    _uid: '5654eef5-cc1c-4c98-a8f3-dd4d16a6002a',
                    name: 'Elio coffee',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23089',
                  },
                  {
                    x: '10',
                    y: '3',
                    _uid: '53ae3028-7af2-484e-a29f-c579705262ea',
                    name: 'Arcadia',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '26422',
                  },
                  {
                    x: '7',
                    y: '18',
                    _uid: '0a40521c-af0b-4ef7-8656-22a3348aa33b',
                    name: 'Claudia',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26350',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Solari',
              },
              {
                _uid: 'd2b3c9ce-2c6a-4a4a-9d3c-3896c84f5da6',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686927/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_5.png',
                hotspots: [
                  {
                    x: '11',
                    y: '6',
                    _uid: '90239808-df81-42bd-bc80-3c623dd511d2',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '26126',
                  },
                  {
                    x: '5',
                    y: '15',
                    _uid: 'ce0933fa-2321-41cf-b355-7e58c66b747e',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25656',
                  },
                  {
                    x: '9',
                    y: '14',
                    _uid: 'b5996548-55a2-4e99-bd6b-dd079c2eae6c',
                    name: 'Sloane chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21138',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper Dining',
              },
              {
                _uid: '04df4740-1164-42aa-bde7-507f0e62297d',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686935/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_7.png',
                hotspots: [
                  {
                    x: '11',
                    y: '9',
                    _uid: '55aad057-1bb1-48db-92df-16058d5a2e19',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25829',
                  },
                  {
                    x: '4',
                    y: '11',
                    _uid: '1559f984-e055-4b3c-bf98-1f36b8997092',
                    name: 'Harper dresser',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25653',
                  },
                  {
                    x: '10',
                    y: '18',
                    _uid: '369f7099-e340-4d89-9639-4ace36cc37e9',
                    name: 'Nola Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25810',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper bed',
              },
              {
                _uid: '74e9000d-323f-4c95-b783-2800489c558c',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686952/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_4.png',
                hotspots: [
                  {
                    x: '12',
                    y: '9',
                    _uid: 'f1cfe063-d6ca-4668-bf5e-163bfc365b06',
                    name: 'Agnes',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27632',
                  },
                  {
                    x: '18',
                    y: '7',
                    _uid: '1423119e-5a99-40b7-9dd8-22c41dd2b3d6',
                    name: 'Blanc',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25603',
                  },
                  {
                    x: '18',
                    y: '12',
                    _uid: '5b47e26e-4be7-4c1e-b455-df63ffe09e17',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25845',
                  },
                  {
                    x: '11',
                    y: '18',
                    _uid: '9be12103-42fa-4bf3-b0b2-a6c8ca611248',
                    name: 'Claudia',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25813',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Agnes',
              },
              {
                _uid: 'aa0edcc2-b669-43b2-9262-320bd64e6624',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686925/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_3.png',
                hotspots: [
                  {
                    x: '5',
                    y: '13',
                    _uid: 'c6d51173-a910-4c5e-86d9-8d060321ef77',
                    name: 'Lira dining chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27146',
                  },
                  {
                    x: '9',
                    y: '7',
                    _uid: '25fbb8d4-b271-467b-8d6a-6af29f8426bd',
                    name: 'Audrey',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24372',
                  },
                  {
                    x: '11',
                    y: '7',
                    _uid: 'ce6e64ba-132a-4660-9619-5f7f2840d434',
                    name: 'Cascade',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26517',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Lira',
              },
              {
                _uid: 'f4f14a8a-46ac-436c-8ad1-5e8686f4b21b',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686958/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_8.png',
                hotspots: [
                  {
                    x: '5',
                    y: '13',
                    _uid: '8637bdd0-754a-46ef-975c-6f6255d611db',
                    name: 'Jaron',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25958',
                  },
                  {
                    x: '15',
                    y: '14',
                    _uid: 'adf3142b-6d4b-4cba-91f4-f60835d27797',
                    name: 'Wayne',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '19706',
                  },
                  {
                    x: '12',
                    y: '17',
                    _uid: '7c672ee6-95cd-4460-a224-af633892ccbc',
                    name: 'Duncan',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23026',
                  },
                  {
                    x: '11',
                    y: '13',
                    _uid: '980c4a17-a43b-4106-9b1f-1cab71342ca3',
                    name: 'Elio coffee table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23089',
                  },
                  {
                    x: '9',
                    y: '12',
                    _uid: 'feed5069-e503-45e1-bce3-ae8e4d634121',
                    name: 'Elio side table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23091',
                  },
                  {
                    x: '19',
                    y: '7',
                    _uid: 'e85d8629-6614-4e8c-94ba-d329688bdb74',
                    name: 'Arcadia',
                    type: '',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '26126',
                  },
                  {
                    x: '8',
                    y: '16',
                    _uid: '2b24982a-11d1-45b6-993e-8f23ed8c8a83',
                    name: 'Muna Area Rug',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24446',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Jaron',
              },
              {
                _uid: '388f7dc1-3d0a-4324-af87-81b071462c37',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686940/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_1.png',
                hotspots: [
                  {
                    x: '11',
                    y: '10',
                    _uid: '92354767-752a-455e-9534-4cd6974ee46c',
                    name: 'Sloane',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22037',
                  },
                  {
                    x: '7',
                    y: '18',
                    _uid: 'b3dabe1c-61f6-4797-bf94-694e2559d3fd',
                    name: 'Cora Rug',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '23333',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Sloane',
              },
              {
                _uid: '8439f53f-d6e3-49eb-8819-f3a0eeffbaf8',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686943/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_2.png',
                hotspots: [
                  {
                    x: '12',
                    y: '9',
                    _uid: 'e2d9e231-dc1a-4dbe-8e5e-5847d8265212',
                    name: 'Dawson sofa',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22609',
                  },
                  {
                    x: '7',
                    y: '14',
                    _uid: 'e435cab6-bc3b-4374-b723-b738c3d39cd2',
                    name: 'Bradley Coffee table',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24024',
                  },
                  {
                    x: '18',
                    y: '8',
                    _uid: 'b15fcbe2-8c7f-4bb6-b1e8-29bb44c6ed5d',
                    name: 'Nadia lamp',
                    type: '',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25616',
                  },
                  {
                    x: '16',
                    y: '18',
                    _uid: '206a2151-f430-42a1-8a5b-7162646c410e',
                    name: 'Ingrid',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21071',
                  },
                  {
                    x: '14',
                    y: '3',
                    _uid: '05d270d5-897c-45bf-9501-8c62036583ef',
                    name: 'Nadine',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '24389',
                  },
                  {
                    x: '3',
                    y: '18',
                    _uid: '6610383d-f463-41b7-8f6e-46fdcf23196f',
                    name: 'Cora Rug',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23333',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Dawson',
              },
            ],
            component: 'Shop The Look List',
            show_view_all_products: false,
          },
          {
            _uid: '06032e36-bbad-4a10-a598-77bf89a191bc',
            component: 'Recommendation Carousel',
            selector_name: 'HP Recommendation #1',
          },
          {
            _uid: '5d020ad9-207a-4de6-ad8a-ff9d8f5b7752',
            link: [
              {
                url: 'https://www.castlery.com/us/press',
                _uid: '22695e97-8952-42d9-b74b-968fec8df8c5',
                text: 'Press',
                component: 'Link V2',
                text_color: '',
              },
            ],
            image: [
              {
                alt: '',
                _uid: '8b277f79-5d29-41ca-b56f-98ba99ecc980',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507484/NEW%20Homepage/AU_Press/AU_Press_v2_Mobile.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507511/NEW%20Homepage/US%20Press/US_Press_v2_Desktop.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507511/NEW%20Homepage/US%20Press/US_Press_v2_Desktop.png',
              },
            ],
            button: [],
            header: '',
            component: 'Link Banner',
            whole_link: true,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '',
            header_level: 'h2',
            background_color: '',
          },
          {
            _uid: '342e7542-22e6-45d9-bda5-542e0eab2ab1',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'See our designs in real homes',
                      type: 'text',
                    },
                    {
                      text: ' ',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '@castleryus',
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://www.instagram.com/castleryus/',
                            uuid: null,
                            anchor: null,
                            target: '_self',
                            linktype: 'url',
                          },
                        },
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#A45B37',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '6f36ba69-e99c-409a-bf47-566136e92b5d',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DPaSddRDI0i/​',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DPaSddRDI0i/​',
                },
                image: [
                  {
                    alt: 'A woman hugging her child while seated on a performance bouclé curved sofa.',
                    _uid: 'eb126a18-62f6-4a4f-8186-0cf4a8eea42e',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'The bouclé on Marlow is so plush, it’s the kind of cozy that lulls your little one to sleep mid-sentence while you stay curled up beside them, completely content. Because honestly, the laundry can wait, but moments like this are non-negotiable.\n\nIn the spotlight: Marlow Performance Bouclé Curve Sofa\nPhotography: @withsarale',
                creator: '@withsarale',
                component: 'ugc-listing',
                product_list: '21241',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@withsarale',
                          type: 'text',
                          marks: [
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#000000',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '5b0cfce4-d58b-4ffd-89db-82dfa34905e4',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DIiAFIKzw4q/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DIiAFIKzw4q/',
                },
                image: [
                  {
                    alt: 'A cream-colored sofa placed in a living room with the sun shining down on it.',
                    _uid: 'd6fe2fac-202a-4259-8dc9-c0303d9bf722',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc2_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc2_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc2_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'It’s time to stop pretending you don’t need that new sofa. Our Spring Sale just got even better — now with up to $400 off, so you can finally upgrade without overthinking. Go ahead and treat yourself, you deserve nice things. \n\nShop now and let your home bloom - link in bio. \n\nIn the spotlight: Jonathan Sofa, Luka TV Stand, Rio Outdoor Dining Table, \n\nPhotography: @im_ericwang , @tiffwang , @styleitprettyhome , @my_friend_jackies_house',
                creator: '@im_ericwang',
                component: 'ugc-listing',
                product_list: '21287',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@im_ericwang',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'b8451260-3ae3-461b-9501-4c47ce6c081c',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DOhmEOvk2LX/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DOhmEOvk2LX/',
                },
                image: [
                  {
                    alt: 'A person sitting with her arm propped up against the backrest of a wooden chair.',
                    _uid: '29c4ba03-3f5c-495b-af82-82da66b205aa',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'Layer warmth into your home with earth-toned pieces that bring coziness and character to your living space.\n\nFrom the wood accents of the Anya Dining Chair and the Serena Floor Mirror, to the decadent brown Damascus marble on the Elio Side Table — these pieces don’t just warm up a room, they make it feel lived-in and loved.\n\nIn the spotlight: Anya Dining Chair, Serena Floor Mirror, Elio Side Table, Philippe Accent Chair\nPhotography: @alyssainthecity',
                creator: '@alyssainthecity',
                component: 'ugc-listing',
                product_list: '27009',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@alyssainthecity',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '316f46ff-a8a0-470a-bf2e-5debbec16930',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DNHMqUQM7Tg/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DNHMqUQM7Tg/',
                },
                image: [
                  {
                    alt: 'A woman sitting on the edge of a lift-up storage bed while packing bedlinen.',
                    _uid: 'a0bddd38-41df-43e0-a8f9-1ce09da8962c',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  "The Dawson doesn’t just hide your storage, it does so effortlessly. The bed's seamless, concealed function keeps your space sleek and your essentials stylishly stashed in a moment's notice.\n\nIn the spotlight: Dawson Storage Bed, Mika Side Table, Cora Wool Area Rug \nPhotography: @raffaela.sofia",
                creator: '@raffaela.sofia',
                component: 'ugc-listing',
                product_list: '23369',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@raffaela.sofia',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '92ef1db5-115b-4cca-af57-df5350a0fd68',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DJiJLrkTD__/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DJiJLrkTD__/',
                },
                image: [
                  {
                    alt: 'A woman hugging her children while playing on a bed.',
                    _uid: '83c9702c-b335-4d3e-9a42-3ae229cdccf6',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'She raised us, fed us, and probably let us jump on the sofa more times than she’d admit. Today’s for her, happy Mother’s Day to the real CEO of the house. How are you celebrating her today?\n\nIn the spotlight: Dawson Pit-Sectional Sofa, Harper Marble TV Unit, Hamilton 3 Seater Sofa, Dawson Bed, \nMadison Leather 3 Seater Sofa \nPhotography: @kerenswan , @kathryndenny , @sonelymateo , @kathrynchristi , @a.freckled.fawn.design',
                creator: '@kerenswan',
                component: 'ugc-listing',
                product_list: '22605',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@kerenswan',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '63b4ad97-305c-45d5-b0f8-06700cc6d47a',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DK_Amuvzbaa/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DK_Amuvzbaa/',
                },
                image: [
                  {
                    alt: 'A white side chaise sectional sofa placed flush against the walls of a living room. ',
                    _uid: '7a1ac11b-e029-4142-9b09-c2c71c844975',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc6_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc6_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc6_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'Our 4th of July Sale kicks off with up to $450 off your favorite Castlery pieces. You bring the long weekend energy — we’ll bring the lounge-ready furniture. 🛋️\n\nIn the spotlight:\nJonathan Extended Side Chaise Sectional Sofa\nDawson Storage Bed\nHamilton Round Chaise Sectional Sofa \nAuburn Chaise Sectional Sofa\nRochelle Bed \nJoseph Boucle Bed\n\nPhotography: @Darthhdaddy @our.peachy.days @Emmamaygravess @Bekhalliday @Ourcountrycoastalhome\n@Isaiah.charles',
                creator: '@bekhalliday',
                component: 'ugc-listing',
                product_list: '21736',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@Bekhalliday',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            header: '#AtHomewithCastlery',
            component: 'Social UGC',
            header_color: '#3C101E',
            nums_in_line: '6',
            background_color: '#F6F3E7',
            navigation_display: true,
          },
          {
            _uid: 'bacb13a8-f799-46ea-acdb-f3d163147a53',
            size: 'medium',
            image: [
              {
                alt: 'A group of people sitting around a dining table lined with food while clinking their glasses.',
                _uid: 'b3bfd4d3-26f2-4284-81df-5905f86921bf',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Mobile-780x1200.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
              },
            ],
            video: [],
            button: [
              {
                _uid: '9fe62d5c-e928-4c01-bbb5-c68922d2c55f',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/us/our-story',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/us/our-story',
                },
                size: 'sm',
                text: 'Read our story',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-our-story',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header:
              'A good piece of furniture opens your eyes to the spaces you already have, and all the life that’s waiting to be lived in them.',
            bg_color: '',
            component: 'full-width-banner',
            sub_header: '',
            text_align: 'center',
            anchor_link: '',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            enlarge_header: false,
            sub_header_color: '#F6F3E7',
            sub_header_level: '',
            klaviyo_signup_form: [],
            banner_selector_name: '',
          },
          {
            _uid: 'a421890f-51ac-41f9-8326-9f5012647cde',
            items: [
              {
                _uid: 'd9167e44-b60c-41b2-92ff-af23c0c75bb3',
                image: [],
                video: [],
                header: 'Who are we?',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Born in Singapore in 2013, we design furniture that lives with you—and gets better with time.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'We obsess over the details most people overlook: the warmth of real teak, the cool elegance of marble, the curve of a chair that just feels right. Every piece is made to last, not just in form but in feeling—functional, timeless, and ready to grow with you through life’s messes, milestones, and everything in between.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Learn more about us',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/our-story',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' or better yet, ',
                          type: 'text',
                        },
                        {
                          text: 'see why our customers love our home furniture',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/reviews',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '52d825e9-78ec-4fbe-9c37-3c0a2463d7f8',
                image: [],
                video: [],
                header: 'What types of modern furniture can you find here? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Explore our range of thoughtfully designed furniture for every room in your home.',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Living room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/us/furniture-sets/living-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: null,
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Our sofas, armchairs, coffee tables, and storage pieces are made for lounging, gathering, and stealing the spotlight—without shouting for it.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Bedroom furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/us/furniture-sets/bedroom-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: null,
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': From sturdy bed frames to sleek nightstands and dressers, our bedroom pieces are crafted for comfort and calm.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Outdoor & patio furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/us/furniture-sets/outdoor-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: null,
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Built with weather-resistant materials and timeless appeal, our outdoor collection is made to handle the elements—and the impromptu BBQ.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Dining room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/us/furniture-sets/dining-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: null,
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Tables that host; Chairs that stay comfortable through dessert. Our dining table sets are functional, elegant, and built for everything from weeknight takeout to celebratory spreads.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Home accessories',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/us/accessories/all-accessories',
                                        uuid: null,
                                        anchor: null,
                                        target: null,
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Rugs, mirrors, lighting, and more—our accessories are the finishing touches that pull it all together. Consider them your space’s secret sauce.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: ' ',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For a fuss-free online shopping experience, we’ve curated ',
                          type: 'text',
                        },
                        {
                          text: 'furniture bundles',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/sale/bundle-sale',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' just for you. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'With just a click, get matching furniture sets for any space in your home.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '7410a78e-af31-485f-9b63-84c470c9d1f0',
                image: [],
                video: [],
                header: 'I need help designing & styling my home – is there a tool that I can use? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'With ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery’s Room Designer Tool',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/room-designer',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ', you can plan your furniture layout, mix and match pieces, and see exactly how everything fits—before you buy. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'It’s the easiest way to design a functional, beautiful space that works for real life.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Looking for ideas? Get inspired by the latest home decor trends, styling tips, and design guides on the ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery Blog',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/blog',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'From material deep-dives to space-saving tricks, it’s your go-to for creating a home that feels like you.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'a5930e03-61d5-4fcc-9c42-a7125897ad71',
                image: [],
                video: [],
                header: 'Need help with shipping, delivery, and warranties? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'We strive to make your Castlery experience seamless—from browsing and checkout to delivery and everyday living. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Here are some perks when you shop with us:',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy free shipping when your order is over $1199.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'We offer three types of delivery options – Standard, Room of Choice, or White Glove.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy 30-day easy returns.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For more details on orders, shipping, returns, or product care, head over to our ',
                          type: 'text',
                        },
                        {
                          text: 'Help Center',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/help-center',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Because bringing beautiful furniture home should feel as good as it looks.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
            ],
            header: 'Shop Online Furniture Store with Modern Designs',
            component: 'Accordion',
            header_color: '#3C101E',
            has_faq_schema: false,
            background_color: '#F6F3E7',
          },
          {
            _uid: '81e1bb71-ab53-438b-95cd-ad6778f55e3b',
            size: 'medium',
            component: 'section-break',
          },
        ],
        meta: [
          {
            _uid: '789af7b7-382f-46aa-82af-c909bbc34c4a',
            title: 'Modern Furniture Store Online',
            keywords:
              'furniture United States, online furniture United States, furniture shop United States, furniture stores United States, furniture in United States, modern furniture United States, furniture US, furniture, Castlery, United States',
            component: 'meta-data',
            description:
              'A modern online furniture store for timeless home furnishings. From sofas to tables and beds, discover designs made to elevate your everyday. Enjoy Buy Now Pay Later and 30-day easy returns.',
            notIndexable: false,
            structure_data:
              '{"@context": "http://schema.org","@type": "WebSite","url": "https://www.castlery.com/us/","name": "Castlery","potentialAction": {"@type": "SearchAction","target": "https://www.castlery.com/us/search?q={search_term_string}","query-input": "required name=search_term_string"}}',
          },
        ],
        timer: [
          {
            _uid: '332aa167-14c3-4d14-8ce6-1c4e8f407cd8',
            ended_at: '',
            component: 'timer',
            published_at: '',
          },
        ],
        component: 'page',
        breadcrumb: '',
        breadcrumbs: '',
        redirect_url: '',
      },
      slug: 'home-page-brand-refresh',
      full_slug: 'us/general-content-v2/main-pages/home-page-brand-refresh',
      sort_by_date: null,
      position: -440,
      tag_list: [],
      is_startpage: false,
      parent_id: 79377877844279,
      meta_data: null,
      group_id: 'f8b57aff-1a0f-456f-9d05-6ee0eeec6a24',
      first_published_at: '2025-10-14T13:10:31.817Z',
      release_id: null,
      lang: 'default',
      path: 'us',
      alternates: [],
      default_full_slug: null,
      translated_slugs: null,
    },
    lastUpdated: '2025-12-10T10:03:18.525Z',
    note: 'Fallback data for US home-page-brand-refresh. Updated: 12/10/2025, 6:03:18 PM',
  },
  au: {
    value: {
      name: 'Home Page Brand Refresh',
      created_at: '2025-10-15T03:40:29.185Z',
      published_at: '2025-12-04T07:56:00.142Z',
      updated_at: '2025-12-04T07:56:00.250Z',
      id: 101621879574994,
      uuid: 'cb2a011e-7fbe-4fd2-a2cf-cb2367533f2b',
      content: {
        _uid: '6c0e7aa5-184a-43d7-a6f1-36422b0d0229',
        body: [
          {
            _uid: '6278f54f-2693-4662-b8c0-6439e56341f3',
            items: [
              {
                _uid: '1cce9375-021a-4d5b-8788-ae0b0580cc4d',
                size: 'large',
                image: [],
                video: [
                  {
                    _uid: '7d85b8f8-6d25-4581-9da4-e9521cb7a844',
                    mute: true,
                    autoplay: true,
                    controls: false,
                    component: 'video',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760687130/marketing/AU/home/EVERGREEN_30_OURSTORY_MOBILE.mp4',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760687130/marketing/AU/home/EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760687130/marketing/AU/home/EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                  },
                ],
                button: [
                  {
                    _uid: 'f37a84ce-a5cb-4282-8654-88c7208f534b',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/au/new',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/au/new',
                    },
                    size: 'sm',
                    text: 'Discover our designs',
                    color: '#F6F3E7',
                    variant: 'secondary',
                    component: 'button',
                    text_color: '#F6F3E7',
                    end_decorator: '',
                    tracking_label: 'hp-hero-s3',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gets better with living',
                bg_color: '#A45B37',
                component: 'full-width-banner',
                sub_header: '',
                text_align: 'center',
                anchor_link: '',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                    },
                  ],
                },
                header_color: '',
                header_level: 'h1',
                enlarge_header: true,
                sub_header_color: '#F6F3E7',
                sub_header_level: 'h2',
                klaviyo_signup_form: [],
                banner_selector_name: 'HP Banner',
              },
            ],
            component: 'Hero',
          },
          {
            _uid: '48b42303-1f6a-4812-bb58-bbb20312dfa1',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Every festive detail finds its place when your space is perfectly set for the season. Explore designs that bring just the right touch of sparkle—and get your home styled for the holidays.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#834024',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: 'f1fc780f-af5a-44db-b9d4-519f5661277f',
                image: [
                  {
                    alt: 'A black chair with a woven seat placed in a dining room.',
                    _uid: '6fc9787f-175f-41f8-b9e5-284f358e182e',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761122989/marketing/US/Secondary%20Widget/1_Newport_2x_v2mobile.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761122745/marketing/US/Secondary%20Widget/1_Newport_2x_v2.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761122745/marketing/US/Secondary%20Widget/1_Newport_2x_v2.jpg',
                  },
                ],
                button: [
                  {
                    _uid: '1bde3447-e0f4-4e8c-9d2f-511d969c3d8c',
                    link: {
                      id: '',
                      url: 'sale/furniture-clearance',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'sale/furniture-clearance',
                    },
                    size: '',
                    text: 'Shop now',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-clearance',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: '',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '57554295-d625-4496-9fd8-25feac263c6d',
                image: [
                  {
                    alt: 'A teak wood outdoor dining table with matching outdoor dining chairs.',
                    _uid: '81f6c3f5-d52b-4ce9-ba43-e8173c84ca00',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/1_Outdoor.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/1_Outdoor.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/1_Outdoor.png',
                  },
                ],
                button: [
                  {
                    _uid: '11ba07f6-50b3-4c45-acdd-1416a048fc99',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/au/outdoor/all-outdoor',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/au/outdoor/all-outdoor',
                    },
                    size: 'sm',
                    text: 'Shop outdoor',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Entertain alfresco in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '75d6c5d1-e295-4c7e-af9b-2760622dd654',
                image: [
                  {
                    alt: 'A white performance fabric sofa and a nesting square coffee table placed in a living room.',
                    _uid: '8d1bca92-4ba1-482f-ae95-d0d4baa8badf',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686742/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/2_Sofa.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686742/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/2_Sofa.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686742/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/2_Sofa.png',
                  },
                ],
                button: [
                  {
                    _uid: '22715e20-d7b0-45d1-8789-54d0f110a5b2',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/au/sofas/all-sofas',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/au/sofas/all-sofas',
                    },
                    size: 'sm',
                    text: 'Shop sofas',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Get together in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'b49ab599-23a4-40e7-ae6d-7d1e2dc22416',
                image: [
                  {
                    alt: 'A round marble coffee table with plates of food placed on its surface.',
                    _uid: '4d76fb04-ed23-4010-a724-355b201a742d',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/3_Table.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/3_Table.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686747/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/3_Table.png',
                  },
                ],
                button: [
                  {
                    _uid: '2151d536-1fa9-47d0-9d7b-a8ae1f6f864f',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/au/tables/all-tables',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/au/tables/all-tables',
                    },
                    size: 'sm',
                    text: 'Shop tables',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gather round in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '01518692-c8d2-4b2d-9f12-68cdbb57d3aa',
                image: [
                  {
                    alt: 'A wooden bed with a wingback headboard placed in a bedroom.',
                    _uid: 'b7827b85-902c-46a6-91ef-662df0854108',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686739/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/4_Bed.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686739/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/4_Bed.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686739/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/AU/4_Bed.png',
                  },
                ],
                button: [
                  {
                    _uid: '7bf6862e-542c-4921-ba2e-9e1cb05c48a2',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/au/beds/all-bedroom',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/au/beds/all-bedroom',
                    },
                    size: 'sm',
                    text: 'Shop beds',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Rest easy in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
            ],
            button: [
              {
                _uid: '6e44bfb3-e121-4758-b123-f03d73e997e7',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/au/all-products',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/au/all-products',
                },
                size: 'sm',
                text: 'Shop now',
                color: '#3C101E',
                variant: 'secondary',
                component: 'button',
                text_color: '#3C101E',
                estate_name: '',
                end_decorator: '',
                tracking_label: '',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header: '',
            component: 'Hover Listing V2',
            direction: 'vertical',
            background: '#F6F3E7',
            header_color: '',
            header_level: 'h2',
            hover_status: true,
            header_position: 'left',
          },
          {
            _uid: '8f475fed-d2d8-4b0a-918c-0adad1ee07f0',
            link: [],
            image: [],
            button: [
              {
                _uid: '6e228088-c76a-4ced-8585-830ff0a8d571',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/au/shop-the-look/living-room',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/au/shop-the-look/living-room',
                },
                size: 'sm',
                text: 'View all',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                end_decorator: '',
                klaviyo_form_id: '',
                start_decorator: '',
              },
            ],
            header: 'Shop the look',
            component: 'Link Banner',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Thoughtfully made by people who live in homes, too. That’s why you love them so much.​',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            background_color: '#3C101E',
          },
          {
            _uid: 'bc97cbb4-da38-4927-b3ff-7734c86aaabb',
            items: [
              {
                _uid: '23491b01-4fd5-4c06-9dac-bbd77d68aeae',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686949/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_8.png',
                hotspots: [
                  {
                    x: '17',
                    y: '11',
                    _uid: 'c1352b28-a5ce-41d9-9daa-e42eb1383752',
                    name: 'Lorna L shape',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25682',
                  },
                  {
                    x: '12',
                    y: '14',
                    _uid: '7a3f309d-b018-4a6b-ac6f-c2f7048f292d',
                    name: 'Guin Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21945',
                  },
                  {
                    x: '10',
                    y: '15',
                    _uid: 'f4b4ca05-a9aa-4b6c-a987-a2b86716de2b',
                    name: 'Guin Coffee Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21943',
                  },
                  {
                    x: '5',
                    y: '16',
                    _uid: '58366171-5116-4a6e-a9ff-d5cd072c2381',
                    name: 'Lorna Armchair',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25609',
                  },
                  {
                    x: '8',
                    y: '11',
                    _uid: '861b1d68-3fd5-4549-854a-96cf56775221',
                    name: 'Olwen Side Table',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '21949',
                  },
                  {
                    x: '9',
                    y: '13',
                    _uid: 'ae517db3-6e1d-47d1-85e8-2f81980a52d0',
                    name: 'Verdant Set',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24884',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Lorna Outdoor sofa',
              },
              {
                _uid: '58292f25-9c52-4729-87c8-d920fda61771',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686932/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_4.png',
                hotspots: [
                  {
                    x: '9',
                    y: '8',
                    _uid: 'bbf76a7a-bd73-417a-b126-4099aa1ddde7',
                    name: 'Mori',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25173',
                  },
                  {
                    x: '5',
                    y: '10',
                    _uid: '85feeb10-5753-4cfe-867f-367fc3507466',
                    name: 'Guin Side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21945',
                  },
                  {
                    x: '10',
                    y: '14',
                    _uid: '86a3a20b-f722-4bdb-a7cf-1a8fc33c45e5',
                    name: 'Hugg Coffee Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24121',
                  },
                  {
                    x: '10',
                    y: '4',
                    _uid: '828094fd-bc76-4385-8db0-d7cf38caeb76',
                    name: 'Kinsley Shelf',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '21719',
                  },
                  {
                    x: '2',
                    y: '10',
                    _uid: '34a4a83f-b324-403e-ae82-ba2267a7a8d4',
                    name: 'Ingrid Chair',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '19767',
                  },
                  {
                    x: '3',
                    y: '15',
                    _uid: '6b0b66be-7df5-439e-9bd0-f834abf4b12f',
                    name: 'Talia Wool Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22118',
                  },
                  {
                    x: '2',
                    y: '19',
                    _uid: 'dafb3250-e30b-4f3f-8aee-e6351df0b966',
                    name: 'Amara Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22860',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Mori Sofa',
              },
              {
                _uid: '38b5abe5-f104-4f97-a80f-6f159b6d4488',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686935/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_1.png',
                hotspots: [
                  {
                    x: '10',
                    y: '6',
                    _uid: '2f93a423-5344-4920-9fd1-79fc976958a5',
                    name: 'Auburn King Bed',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24339',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Auburn Bed',
              },
              {
                _uid: 'c87481a2-507f-4aa4-97f3-e3476aaa936d',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686956/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_7.png',
                hotspots: [
                  {
                    x: '14',
                    y: '13',
                    _uid: 'a5a8eb8f-53d4-485e-bfc4-d5f7c065ba62',
                    name: 'Rio Teak Chaise Lounge',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25000',
                  },
                  {
                    x: '4',
                    y: '10',
                    _uid: '34c90a66-f46a-45cb-86b4-d103f1b7ec63',
                    name: 'Rio Bar Chart',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26116',
                  },
                  {
                    x: '9',
                    y: '12',
                    _uid: '5a4b0d4a-5bd4-4982-b2c1-729c03b9002a',
                    name: 'Rio C-side Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24976',
                  },
                  {
                    x: '10',
                    y: '10',
                    _uid: 'eeca785b-8620-4baf-b3d5-b3e0d2c9dcd4',
                    name: 'Carafe Set',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24880',
                  },
                  {
                    x: '3',
                    y: '9',
                    _uid: 'a59aceb1-048c-4552-b4a1-04cccd602655',
                    name: 'Verdant Tall Drinking Set',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24884',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Rio Outdoor Pool',
              },
              {
                _uid: 'a9196771-611d-41e9-b1d0-3cbd113ed3b8',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686941/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_6.png',
                hotspots: [
                  {
                    x: '7',
                    y: '11',
                    _uid: '4be63a1a-d396-47f1-afc8-e151633366c3',
                    name: 'Isla Dining Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25952',
                  },
                  {
                    x: '14',
                    y: '15',
                    _uid: 'd210e3e3-6344-488a-a5c6-a71dafe1b5b7',
                    name: 'Isla Dining Bench',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25552',
                  },
                  {
                    x: '6',
                    y: '13',
                    _uid: '1ad1ad60-c66e-4db2-b345-deb7a5dc6b70',
                    name: 'Isla Dining Chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25548',
                  },
                  {
                    x: '11',
                    y: '10',
                    _uid: '1e9a2197-2e15-4135-a8e1-b283b4cc4ac0',
                    name: 'Verdant Pitcher',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24882',
                  },
                  {
                    x: '10',
                    y: '10',
                    _uid: '502e92a0-2ad0-41d2-b687-be04e79f86e6',
                    name: 'Verdant Set All-purpose',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24883',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Isla outdoor Dining',
              },
              {
                _uid: '0f35124a-9be5-428e-9c45-d8c2b1715fd2',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686937/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_2.png',
                hotspots: [
                  {
                    x: '13',
                    y: '8',
                    _uid: 'd230de38-6e76-4286-ac15-bb74b9c331a2',
                    name: 'Posey Dining Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25306',
                  },
                  {
                    x: '19',
                    y: '10',
                    _uid: '6dac26f1-7aa3-44bb-8eda-7fdfde1f35d0',
                    name: 'Anya Dining Chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25320',
                  },
                  {
                    x: '12',
                    y: '8',
                    _uid: '692c2aac-cab1-46f3-9b5c-bb092137fa28',
                    name: 'Cascade Grey Tall Drinking Glasses',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24899',
                  },
                  {
                    x: '7',
                    y: '6',
                    _uid: 'baea722f-c47f-4c94-b64d-ddb3396e90c8',
                    name: 'Grace Dining ware',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22791',
                  },
                  {
                    x: '14',
                    y: '19',
                    _uid: 'b68ffa22-c3fb-4d3b-8d84-0d66543fa6f3',
                    name: 'Arta Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24537',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Posey Dining Table',
              },
              {
                _uid: '92b66e96-6da8-4568-abd6-5a2ac01a9ab0',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686929/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_3.png',
                hotspots: [
                  {
                    x: '10',
                    y: '10',
                    _uid: 'd18768fe-86c6-49ca-baa5-2f88e5e1668f',
                    name: 'Lily Sideboard',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22373',
                  },
                  {
                    x: '3',
                    y: '17',
                    _uid: '78689a89-6c16-434e-bbeb-7ccacc2da254',
                    name: 'Arial Chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22807',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Storage',
              },
              {
                _uid: '06d096f0-9970-4404-b827-3d562366720f',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686952/NEW%20Homepage/Brand%20Refresh%20V2%20STL/AU/Homepage/Homepage_5.png',
                hotspots: [
                  {
                    x: '7',
                    y: '11',
                    _uid: 'd8b26267-ba8b-48af-bccb-223cc8e94aca',
                    name: 'Rio Dining Table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25125',
                  },
                  {
                    x: '10',
                    y: '13',
                    _uid: 'fd6238ab-57e5-4354-8818-4398bd2490d0',
                    name: 'Grace Dinner Ware',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22790',
                  },
                  {
                    x: '15',
                    y: '11',
                    _uid: '13f939c1-2e59-4ac4-a55d-47c2e5c6b201',
                    name: 'Verdant Pitcher',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24882',
                  },
                  {
                    x: '12',
                    y: '12',
                    _uid: '880f4629-af85-4af5-8d7e-6826eb7aad0b',
                    name: 'Verdant Set',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '24883',
                  },
                  {
                    x: '3',
                    y: '10',
                    _uid: '1529d7c6-8590-46dc-bde0-f8fdc695d0fd',
                    name: 'Isla Chair',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '25543',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Rio Dining',
              },
            ],
            component: 'Shop The Look List',
            show_view_all_products: false,
          },
          {
            _uid: '39c824a1-bdea-477d-95b0-db10fb2244b7',
            component: 'Recommendation Carousel',
            selector_name: 'HP Recommendation #1',
          },
          {
            _uid: 'e4b842bc-2ab9-42c1-aa00-f5cf2ce710dc',
            link: [
              {
                url: 'https://www.castlery.com/au/press',
                _uid: '124089f0-c07f-4531-b9a9-685981ea7596',
                text: 'Press',
                component: 'Link V2',
                text_color: '#fff',
              },
            ],
            image: [
              {
                alt: 'press',
                _uid: '4dc93acd-e6d2-44cf-8c3a-df9bb4710552',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507484/NEW%20Homepage/AU_Press/AU_Press_v2_Mobile.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507485/NEW%20Homepage/AU_Press/AU_Press_v2_Desktop.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507485/NEW%20Homepage/AU_Press/AU_Press_v2_Desktop.png',
              },
            ],
            button: [],
            header: '',
            component: 'Link Banner',
            whole_link: true,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '',
            header_level: 'h2',
            background_color: '',
          },
          {
            _uid: 'dc95c030-7415-4108-b4a7-36dbf695426b',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'See our designs in real homes ',
                      type: 'text',
                    },
                    {
                      text: '@castleryau',
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://www.instagram.com/castleryau?igsh=MWw5dXVqZ24xbHR6MQ==',
                            uuid: null,
                            anchor: null,
                            target: '_self',
                            linktype: 'url',
                          },
                        },
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#A45B37',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: 'fa8e5f31-ed4b-4283-90eb-4f18906e5cac',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DPyFcoajpjU/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DPyFcoajpjU/',
                },
                image: [
                  {
                    alt: 'An l-shape sectional sofa with an ottoman placed in a living room.',
                    _uid: 'f2224e13-980a-4169-afb3-ed44bd8fd178',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041014/marketing/AU/Others/Dawson_L-Shape_Sectional_Sofa_with_Ottoman_and_Tessa_Cotton_Area_Rug.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041014/marketing/AU/Others/Dawson_L-Shape_Sectional_Sofa_with_Ottoman_and_Tessa_Cotton_Area_Rug.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041014/marketing/AU/Others/Dawson_L-Shape_Sectional_Sofa_with_Ottoman_and_Tessa_Cotton_Area_Rug.jpg',
                  },
                ],
                video: [],
                content:
                  'Not quite summer, but close enough to start living like it. The Dawson keeps things easy. Light, soft, and somewhere between sofa and cloud. \n⁠\nIn the spotlight: Dawson L Shape Sectional Sofa with Ottoman\n\nPhotography: @valegenta',
                creator: '@valegenta',
                component: 'ugc-listing',
                product_list: '26473',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@valegenta',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'e30ab211-2eef-4abc-b5ee-0ca4cc7b974b',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/kerrieann.jones/p/DOk6YzSEmkm/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/kerrieann.jones/p/DOk6YzSEmkm/',
                },
                image: [
                  {
                    alt: 'A performance fabric curved bedframe with a burl wood side table placed next to it.',
                    _uid: '1d191620-629c-4772-ba7e-0c213ca07246',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041306/marketing/AU/Others/Rochelle_Bed_Mika_Burl_Wood_Side_Table_1.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041306/marketing/AU/Others/Rochelle_Bed_Mika_Burl_Wood_Side_Table_1.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041306/marketing/AU/Others/Rochelle_Bed_Mika_Burl_Wood_Side_Table_1.jpg',
                  },
                ],
                video: [],
                content:
                  'There’s nothing I love more than to cosying up on a Sunday evening with a book in hand, soaking up the last few moments of the week. I recently updated my home with a reading nook using @castleryau Posey bookshelf and Arlo armchair. I love the sculptural shapes of the bookshelf and the upholstery on this armchair is stunning.\nIt’s a simple update that has made Sunday evenings a night I look forward to.\n\nWearing @annaquanlabel',
                creator: '@kerrieann.jones',
                component: 'ugc-listing',
                product_list: '24330',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'kerrieann.jones',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/kerrieann.jones/',
                                uuid: null,
                                anchor: null,
                                target: '_blank',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#000000',
                              },
                            },
                            {
                              type: 'bold',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'fda7f369-5d40-4674-a44a-619f64101d69',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DNaFvpkuR_E/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DNaFvpkuR_E/',
                },
                image: [
                  {
                    alt: 'A person sitting on a burnt orange-coloured performance bouclé chaise sectional sofa. ',
                    _uid: 'f35bad08-3699-45cd-a221-992505f483fc',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041614/marketing/AU/Others/IMG_1759.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041614/marketing/AU/Others/IMG_1759.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041614/marketing/AU/Others/IMG_1759.jpg',
                  },
                ],
                video: [],
                content:
                  'Obsessed with Marlow in ginger bouclé? Us too. She also comes in other colours, with customisable fabrics so she blends into any space, your way. Now the hard part — picking just one.\n\nIn the spotlight: Olwen Coffee Table, Marlow Perfomance Boucle Chaise Sectional Sofa and Harper Marble TV Unit\nPhotography: @gemma_peanutIt’s a simple update that has made Sunday evenings a night I look forward to.\n\nWearing @annaquanlabel',
                creator: '@gemma_peanut',
                component: 'ugc-listing',
                product_list: '23972',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'gemma_peanut',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/gemma_peanut/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '0c4c344d-6d40-4c37-9473-f87d5d938a16',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DNFUSQPMvBk/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DNFUSQPMvBk/',
                },
                image: [
                  {
                    alt: 'Three children play around a wooden dining table/',
                    _uid: '7e99ccd8-f345-4a87-b104-9ab37cc180a6',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041961/marketing/AU/Others/Photo_15-7-2025_3_31_09_pm.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041961/marketing/AU/Others/Photo_15-7-2025_3_31_09_pm.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761041961/marketing/AU/Others/Photo_15-7-2025_3_31_09_pm.jpg',
                  },
                ],
                video: [],
                content:
                  'Crafted from acacia wood, Casa’s sturdy enough for long lunches with friends or slow brekkies with the fam — the kind of table that turns meals into memories.\n\nIn the spotlight: Casa Dining Table with Bench Set, Austen Chair and Kelsey Leather Chair\nPhotography: @bybrittanynoonan and @samanthaarandazzo',
                creator: '@bybrittanynoonan',
                component: 'ugc-listing',
                product_list: '26041',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'gemma_peanut',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/gemma_peanut/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'c2f58ba9-b860-4da4-9bc6-f6f7c25ecc9e',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DMXNb_COeWE/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DMXNb_COeWE/',
                },
                image: [
                  {
                    alt: 'A person sitting at the edge of a storage bed while storing bedlinen.',
                    _uid: '59f763d4-d360-4cbd-8ea9-93187c41bdff',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095585/marketing/AU/Others/DSCF7129.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095585/marketing/AU/Others/DSCF7129.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095585/marketing/AU/Others/DSCF7129.jpg',
                  },
                ],
                video: [],
                content:
                  'The secret to a tidy bedroom? Dawson’s under-bed storage hides spare linens and off-season clothes so well, the whole space feels tidier (even if I’m not).\n\nIn the spotlight: Dawson Storage Bed, Mika Side Table and Cora Wool Area Rug\nPhotography: @raffaela.sofia',
                creator: '@raffaela.sofia',
                component: 'ugc-listing',
                product_list: '22166',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'raffaela.sofia',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/raffaela.sofia/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '495eef15-58f2-4b9e-b1e8-77066eb70eba',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DL7Ee4LNHTd/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DL7Ee4LNHTd/',
                },
                image: [
                  {
                    alt: 'A mindi wood curved dresser with 6 drawers.',
                    _uid: '2ceb039e-f22e-4862-b473-b64f86d7cff0',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095863/marketing/AU/Others/Crescent_6-Drawer_Dresser_1.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095863/marketing/AU/Others/Crescent_6-Drawer_Dresser_1.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761095863/marketing/AU/Others/Crescent_6-Drawer_Dresser_1.jpg',
                  },
                ],
                video: [],
                content:
                  'Two colours, two moods, same obsession with good storage. Crescent keeps it light with unique burlwood drawers, while Ariel brings the depth with rich tones and woven-front doors. Which mood matches your space best?\n\nIn the spotlight: Crescent 6-Drawer Dresser and Ariel Sideboard\nPhotography: @juthamat.by.jem',
                creator: '@juthamat.by.jem',
                component: 'ugc-listing',
                product_list: '22317',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'juthamat.by.jem',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/juthamat.by.jem/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '39988f96-c70c-42f5-8161-53d43abcb845',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DJn5_sStGzr/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DJn5_sStGzr/',
                },
                image: [
                  {
                    alt: 'A white performance fabric 3-seater sofa placed in a living room.',
                    _uid: '4e82bcaa-a440-43cc-9087-2c8df9670029',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096358/marketing/AU/Others/Mori_3_Seater_Casa_Console_Table_2.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096358/marketing/AU/Others/Mori_3_Seater_Casa_Console_Table_2.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096358/marketing/AU/Others/Mori_3_Seater_Casa_Console_Table_2.jpg',
                  },
                ],
                video: [],
                content:
                  'Adulting level: matching my furniture to my emotional state — calm and collected. I’m all in on natural textures with a touch of luxe. It’s the mix of materials that keeps it interesting. Mori, Casa, and Harper, I see you.\n\nIn the spotlight: Mori Performance Fabric 3 Seater Sofa, Casa Console Table and \nHarper Marble TV Unit\nPhotography: @winnie.loves',
                creator: '@winnie.loves',
                component: 'ugc-listing',
                product_list: '25279',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'winnie.loves',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/winnie.loves/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'dcd62847-6bcd-4e0a-8eb6-7ddd20d1f28a',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DJn5_sStGzr/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DJn5_sStGzr/',
                },
                image: [
                  {
                    alt: 'A large plant placed behind a performance fabric curved sofa in the living room with a large painting on a wall beside it.',
                    _uid: '99f8bba1-bf02-4e25-aaf1-8cc3a36734a9',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096653/marketing/AU/Others/RB_Marlow_Boucle_Chaise_Sectional_Sofa_5.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096653/marketing/AU/Others/RB_Marlow_Boucle_Chaise_Sectional_Sofa_5.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761096653/marketing/AU/Others/RB_Marlow_Boucle_Chaise_Sectional_Sofa_5.jpg',
                  },
                ],
                video: [],
                content:
                  'Marlow, two ways. Spill-resistant bouclé and modular design mean you can shape the perfect fit, big or small.\n\nIn the spotlight: Marlow Performance Bouclé Chaise Sectional Sofa, Marlow Performance Bouclé Armless Sofa\nPhotography: @bbbuffaloe',
                creator: '@bbbuffaloe',
                component: 'ugc-listing',
                product_list: '19930',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'bbbuffaloe',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/bbbuffaloe/',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'ddaab3dc-ce4f-42aa-b450-034b1379c0aa',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/amy_isha_hembrow/p/DIiUJOEOzOH/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/amy_isha_hembrow/p/DIiUJOEOzOH/',
                },
                image: [
                  {
                    alt: 'Two children kneeling down in front of a green sideboard to look for things.',
                    _uid: 'dbc8db0f-7c22-49db-9bfb-edd349ff2b82',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761098546/marketing/AU/Others/L1110154.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761098546/marketing/AU/Others/L1110154.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761098546/marketing/AU/Others/L1110154.jpg',
                  },
                ],
                video: [],
                content:
                  'A little colour goes a long way. This console The Luna Sideboard from @castleryau brings the warmth our space was missing. I love a neutral home, but sometimes too beige is just… beige. This piece adds the perfect depth and gives me all the storage I need. Win-win #AtHomeWithCastlery, #homedecorideas, #homedecortips, #homemakeover #ad',
                creator: '@amy_isha_hembrow',
                component: 'ugc-listing',
                product_list: '15502',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@',
                          type: 'text',
                        },
                        {
                          text: 'amy_isha_hembrow',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.instagram.com/amy_isha_hembrow',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#000000',
                              },
                            },
                            {
                              type: 'bold',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '8161e05a-3b58-4b56-bf8c-ceaac4380d02',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryau/p/DH2lZssMKWx/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryau/p/DH2lZssMKWx/',
                },
                image: [
                  {
                    alt: 'A person sitting on a performance fabric chaise sectional sofa with a magazine in hand.',
                    _uid: '73f7dabd-1edb-46ec-a692-463ae3c8d071',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761112781/marketing/AU/Others/Mori_Chaise_Sectional_Sofa_9.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761112781/marketing/AU/Others/Mori_Chaise_Sectional_Sofa_9.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761112781/marketing/AU/Others/Mori_Chaise_Sectional_Sofa_9.jpg',
                  },
                ],
                video: [],
                content:
                  'White sofa dreams? Mori’s not just a pretty face, it’s feather-filled and comfy enough for you and your plus three (yes, pets absolutely count).⁠\n⁠\nIn the spotlight: Mori Performance Fabric Chaise Sectional Sofa, Mori Build-Your-Own Living Room Set, 2-3 Seater⁠\nPhotography: @sacha.strebe, @bradytolbert',
                creator: '@sacha.strebe',
                component: 'ugc-listing',
                product_list: '25302',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@sacha.strebe',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'a87e1d2f-9645-47e7-ab9d-a54a8c23edef',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/neutralcatt/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/neutralcatt/',
                },
                image: [
                  {
                    alt: 'A wooden dining table with a matching dining bench and four woven dining chairs.',
                    _uid: '1beba77d-176b-4273-8997-8a95481dd793',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066057/marketing/Cross-Market/Social%20Widget/e1eff416978a5193e1cf_vifsmj.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066057/marketing/Cross-Market/Social%20Widget/e1eff416978a5193e1cf_vifsmj.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066057/marketing/Cross-Market/Social%20Widget/e1eff416978a5193e1cf_vifsmj.jpg',
                  },
                ],
                video: [],
                content: 'Sharing some stills of our recent dining space refresh with castlery',
                creator: '@neutralcatt',
                component: 'ugc-listing',
                product_list: '26041',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@neutralcatt',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '8df8a8d4-e2c1-4e3c-b117-8db443ea1a69',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DL1z5FrveI6/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DL1z5FrveI6/',
                },
                image: [
                  {
                    alt: 'A bed with a wingback headboard and a wooden end-of-bed bench.',
                    _uid: '8f11d298-c5ef-48c2-ad41-e9dc4ac653b7',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754622988/marketing/US/Social%20Widget/US_UGC_4_home.style.by.tiff_daltonbed.webp',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754622988/marketing/US/Social%20Widget/US_UGC_4_home.style.by.tiff_daltonbed.webp',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754622988/marketing/US/Social%20Widget/US_UGC_4_home.style.by.tiff_daltonbed.webp',
                  },
                ],
                video: [],
                content: 'Some snippets of home lately 🏡 ',
                creator: '@home.style.by.tiff',
                component: 'ugc-listing',
                product_list: '24824',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'table',
                      content: [
                        {
                          type: 'tableRow',
                          content: [
                            {
                              type: 'tableCell',
                              attrs: {
                                colspan: 1,
                                rowspan: 1,
                                colwidth: null,
                                backgroundColor: null,
                              },
                              content: [
                                {
                                  type: 'paragraph',
                                  content: [
                                    {
                                      text: 'home.style.by.tiff',
                                      type: 'text',
                                      marks: [
                                        {
                                          type: 'link',
                                          attrs: {
                                            href: 'https://www.instagram.com/p/DL1z5FrveI6/',
                                            uuid: null,
                                            anchor: null,
                                            target: null,
                                            linktype: 'url',
                                          },
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'f53f07f1-83a2-435d-aabc-4a742202fb10',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DFbQ9JETOrd/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DFbQ9JETOrd/',
                },
                image: [
                  {
                    alt: 'A white l-shape sectional sofa placed against the wall in a living room.',
                    _uid: '708bc7d6-45a0-49df-9f18-95825ec3e1db',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_8_bekhalliday_jonathansofa.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_8_bekhalliday_jonathansofa.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_8_bekhalliday_jonathansofa.jpg',
                  },
                ],
                video: [],
                content: '"If my living room were a song 🎵 ✨️\nIt would be a laid back with modern, cool vibes. 😎"',
                creator: '@bekhalliday',
                component: 'ugc-listing',
                product_list: '23889',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@bekhalliday',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '1e650b95-09d8-44dd-a1ce-3598914d3255',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DK9qvRZxXX4/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DK9qvRZxXX4/',
                },
                image: [
                  {
                    alt: 'A wooden sideboard with tambour details.',
                    _uid: '26018bf3-5428-48b5-bb9e-bf4b430fb50f',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_10_theblushhome_harpersideboard_emplifi.webp',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_10_theblushhome_harpersideboard_emplifi.webp',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1754623822/marketing/US/Social%20Widget/US_UGC_10_theblushhome_harpersideboard_emplifi.webp',
                  },
                ],
                video: [],
                content:
                  'This little living room has had a few glow-ups since I moved in a year and a half ago, but it finally feels like home. ✨',
                creator: '@theblushhome',
                component: 'ugc-listing',
                product_list: '25095',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '030ff6ce-5b33-4601-a5e5-54eb1d11880c',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/joeydjia/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/joeydjia/',
                },
                image: [
                  {
                    alt: 'A leather extended sofa with a throw draped over the backrest.',
                    _uid: 'ac0b8667-5216-4944-a5a2-a12d6c672aec',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066525/marketing/Cross-Market/Social%20Widget/c445373c568a98744d26_vaxqzw.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066525/marketing/Cross-Market/Social%20Widget/c445373c568a98744d26_vaxqzw.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066525/marketing/Cross-Market/Social%20Widget/c445373c568a98744d26_vaxqzw.jpg',
                  },
                ],
                video: [],
                content:
                  'i am so happy with the outcome of our living/dining space, styled with castlery furniture. we were juggling a bunch of goals such as choosing baby friendly furniture with curved edges for coffee tables, whilst keeping it warm and cozy with the goal of a timeless look. we also had quite a narrow space to work with but a large couch was really important to me with enough seating to host my family. we pulled it off perfectly and now this area feels like a home.',
                creator: '@joeydjia',
                component: 'ugc-listing',
                product_list: '20949',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@joeydjia',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '2f13d2c7-e917-40bf-824f-2431816931a1',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/cubanhideaway/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/cubanhideaway/',
                },
                image: [
                  {
                    alt: 'A curved performance fabric 3-seater sofa with an ottoman placed on top of an area rug.',
                    _uid: '5a58946f-6b18-4855-898f-b890433a3b4c',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066976/marketing/Cross-Market/Social%20Widget/d5dcbd8e0969347ae120_plortf.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066976/marketing/Cross-Market/Social%20Widget/d5dcbd8e0969347ae120_plortf.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1755066976/marketing/Cross-Market/Social%20Widget/d5dcbd8e0969347ae120_plortf.jpg',
                  },
                ],
                video: [],
                content: 'The house feels.... creamy and cosy ☁️',
                creator: '@cubanhideaway',
                component: 'ugc-listing',
                product_list: '20338',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@this is a very long instagram username',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            header: '#AtHomewithCastlery',
            component: 'Social UGC',
            header_color: '#3C101E',
            nums_in_line: '6',
            background_color: '#F6F3E7',
            navigation_display: true,
          },
          {
            _uid: '4b0d59d3-b741-40af-b6fd-3fd8e9ce81d4',
            size: 'medium',
            image: [
              {
                alt: 'A black chair with a woven seat placed in a dining room.',
                _uid: '07237068-44b5-443e-95d5-600852776f12',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Mobile-780x1200.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
              },
            ],
            video: [],
            button: [
              {
                _uid: '59aed193-d8a6-4d3a-8486-d7fb9b5b7de2',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/au/our-story',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/au/our-story',
                },
                size: 'sm',
                text: 'Read our story',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                estate_name: '',
                end_decorator: '',
                tracking_label: '',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header:
              'A good piece of furniture opens your eyes to the spaces you already have, and all the life that’s waiting to be lived in them.',
            bg_color: '',
            component: 'full-width-banner',
            sub_header: '',
            text_align: 'center',
            anchor_link: '',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '',
            header_level: 'h2',
            sub_header_color: '',
            sub_header_level: '',
            klaviyo_signup_form: [],
            banner_selector_name: '',
          },
          {
            _uid: '74553002-b91b-49ae-88cf-a38fa662fe40',
            items: [
              {
                _uid: '7e896b6f-6b86-400a-b2f2-90985b0eb5a2',
                image: [],
                video: [],
                header: 'Who are we?',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Born in Singapore in 2013, we design furniture that lives with you—and gets better with time.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'We obsess over the details most people overlook: the warmth of real teak, the cool elegance of marble, the curve of a chair that just feels right. Every piece is made to last, not just in form but in feeling—functional, timeless, and ready to grow with you through life’s messes, milestones, and everything in between.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Learn more about us',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/our-story',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' or better yet, ',
                          type: 'text',
                        },
                        {
                          text: 'see why our customers love our home furniture',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/reviews',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'f045d609-9d90-436c-beac-6bd8d9405a7a',
                image: [],
                video: [],
                header: 'What types of modern furniture can you find here? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Explore our range of thoughtfully designed furniture for every room in your home.',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Living room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/au/furniture-sets/living-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Our sofas, armchairs, coffee tables, and storage pieces are made for lounging, gathering, and stealing the spotlight—without shouting for it.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Bedroom furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/au/furniture-sets/bedroom-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': From sturdy bed frames to sleek bedside tables and dressers, our bedroom pieces are crafted for comfort and calm.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Outdoor & patio furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/au/furniture-sets/outdoor-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Built with weather-resistant materials and timeless appeal, our outdoor collection is made to handle the elements—and the impromptu BBQ.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Dining room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/au/furniture-sets/dining-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Tables that host; Chairs that stay comfortable through dessert. Our dining table sets are functional, elegant, and built for everything from weeknight takeout to celebratory spreads.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Home accessories',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/au/accessories/all-accessories',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Rugs, mirrors, lighting, and more—our accessories are the finishing touches that pull it all together. Consider them your space’s secret sauce.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: ' ',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For a fuss-free online shopping experience, we’ve curated ',
                          type: 'text',
                        },
                        {
                          text: 'furniture bundles',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/sale/bundle-sale',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' just for you. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'With just a click, get matching furniture sets for any space in your home.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'eaa058f1-aa90-4624-bcdd-9e0b6b594676',
                image: [],
                video: [],
                header: 'I need help designing & styling my home – is there a tool that I can use? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'With ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery’s Room Designer Tool',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/room-designer',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ', you can plan your furniture layout, mix and match pieces, and see exactly how everything fits—before you buy. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'It’s the easiest way to design a functional, beautiful space that works for real life.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Looking for ideas? Get inspired by the latest home decor trends, styling tips, and design guides on the ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery Blog',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/blog',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'From material deep-dives to space-saving tricks, it’s your go-to for creating a home that feels like you.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'c3a34ad2-12e6-492d-8514-d7fda105619e',
                image: [],
                video: [],
                header: 'Need help with shipping, delivery, and warranties? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'We strive to make your Castlery experience seamless—from browsing and checkout to delivery and everyday living. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Here are some perks when you shop with us:',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'We offer three types of delivery options – Standard, Room of Choice, or White Glove.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy 30-day easy returns.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For more details on orders, shipping, returns, or product care, head over to our ',
                          type: 'text',
                        },
                        {
                          text: 'Help Center',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/au/help-center',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Because bringing beautiful furniture home should feel as good as it looks.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
            ],
            header: 'Shop Online Furniture Store with Modern Designs',
            component: 'Accordion',
            header_color: '#3C101E',
            has_faq_schema: false,
            background_color: '#F6F3E7',
          },
        ],
        meta: [
          {
            _uid: '3a017921-f9b2-4e2b-875b-2cd8b3341a97',
            title: 'Modern Furniture Store Online',
            keywords:
              'furniture Australia, online furniture Australia, furniture Sydney, furniture Melbourne, furniture shop Australia, furniture stores Australia, furniture in Australia, modern furniture Australia, furniture AU, furniture, Castlery',
            component: 'meta-data',
            description:
              'For modern home furnishings from sofas, dining tables, beds & more, shop our online furniture store or visit our showroom. We deliver Australia-wide.',
            structure_data:
              '{"@context": "http://schema.org","@type": "WebSite","url": "https://www.castlery.com/au/","name": "Castlery","potentialAction": {"@type": "SearchAction","target": "https://www.castlery.com/au/search?q={search_term_string}","query-input": "required name=search_term_string"}}',
          },
        ],
        timer: [],
        component: 'page',
        breadcrumb: '',
        redirect_url: '',
      },
      slug: 'home-page-brand-refresh',
      full_slug: 'au/general-content-v2/main-pages/home-page-brand-refresh',
      sort_by_date: null,
      position: -694605,
      tag_list: [],
      is_startpage: false,
      parent_id: 79389094814544,
      meta_data: null,
      group_id: 'd1544932-a5bf-474e-9f6b-53b1e205c82c',
      first_published_at: '2025-10-15T03:40:40.933Z',
      release_id: null,
      lang: 'default',
      path: 'au',
      alternates: [],
      default_full_slug: null,
      translated_slugs: null,
    },
    lastUpdated: '2025-12-10T10:03:19.162Z',
    note: 'Fallback data for AU home-page-brand-refresh. Updated: 12/10/2025, 6:03:19 PM',
  },
  ca: {
    value: {
      name: 'Home Page Brand Refresh',
      created_at: '2025-10-20T09:09:20.323Z',
      published_at: '2025-12-08T08:35:03.143Z',
      updated_at: '2025-12-08T08:35:03.179Z',
      id: 103472170316854,
      uuid: 'ca3280d1-3be3-4a48-bfcd-5982dc8ecf19',
      content: {
        _uid: '4dafc377-36e8-474e-b581-7750cf3ed7fb',
        body: [
          {
            _uid: 'e343da0d-a6f2-4dd5-97e0-a8146f500a41',
            items: [
              {
                _uid: 'aa3f9233-d14f-4f24-8dc4-84a87d52da0b',
                size: 'large',
                image: [],
                video: [
                  {
                    _uid: '8c798737-045a-44bb-8eaa-3012a479a187',
                    mute: true,
                    autoplay: true,
                    controls: false,
                    component: 'video',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683580/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_MOBILE.mp4',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                  },
                ],
                button: [
                  {
                    _uid: '1aaa6662-c1a4-47b7-8837-6acd889206e2',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/ca/new',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/ca/new',
                    },
                    size: 'sm',
                    text: 'Discover our designs',
                    color: '#F6F3E7',
                    variant: 'secondary',
                    component: 'button',
                    text_color: '#F6F3E7',
                    end_decorator: '',
                    tracking_label: 'hp-hero-s3',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gets better with living',
                bg_color: '#F6F3E7',
                component: 'full-width-banner',
                sub_header: '',
                text_align: 'center',
                anchor_link: '',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                    },
                  ],
                },
                header_color: '#F6F3E7',
                header_level: 'h1',
                enlarge_header: true,
                sub_header_color: '#F6F3E7',
                sub_header_level: '',
                klaviyo_signup_form: [],
                banner_selector_name: 'HP Banner',
              },
            ],
            component: 'Hero',
          },
          {
            _uid: '704c6152-43ed-4b3c-81c0-a93584eaf4da',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Every festive detail finds its place when your space is perfectly set for the season. Explore designs that bring just the right touch of sparkle—and get your home styled for the holidays.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '0b287ce0-d74e-4eb7-85c8-807736dc3d47',
                image: [
                  {
                    alt: 'A leather sofa and a performance fabric armchair placed in a living room.',
                    _uid: '823d9a5e-5470-402d-b5f9-3238e3f76395',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182485/marketing/CA/Secondary%20Widgets/3_JonathanSofa.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182485/marketing/CA/Secondary%20Widgets/3_JonathanSofa.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182485/marketing/CA/Secondary%20Widgets/3_JonathanSofa.png',
                  },
                ],
                button: [
                  {
                    _uid: '2c4fe3de-0541-4f22-818a-e34170e5cabd',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/ca/sofas/all-sofas',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/ca/sofas/all-sofas',
                    },
                    size: 'sm',
                    text: 'Shop sofas',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-sofas',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Get together in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '62ac0797-a0c3-4b2c-89f7-211b1267e1d7',
                image: [
                  {
                    alt: 'A bed with a fabric headboard placed in a bedroom.',
                    _uid: '6f16f8f7-2386-4b51-95a8-2838f3950c75',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/1_daltonstoragebed.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/1_daltonstoragebed.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/1_daltonstoragebed.png',
                  },
                ],
                button: [
                  {
                    _uid: '79a2e626-dd52-4c4f-9311-e73cba34bdea',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/ca/beds/all-bedroom',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/ca/beds/all-bedroom',
                    },
                    size: 'sm',
                    text: 'Shop beds',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-bed',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Rest easy in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '99ae7809-87c6-4d70-98e9-637182b919b1',
                image: [
                  {
                    alt: 'A 4-tier dark wood shelf with books, potted plants, frames, candles and Christmas decor on top.',
                    _uid: '0eb82d48-260b-4d5e-ae85-8b7606a82015',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182487/marketing/CA/Secondary%20Widgets/2_SloaneShelf.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182487/marketing/CA/Secondary%20Widgets/2_SloaneShelf.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182487/marketing/CA/Secondary%20Widgets/2_SloaneShelf.png',
                  },
                ],
                button: [
                  {
                    _uid: '7929e2b8-e260-4647-b1ea-f441996d1d97',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/ca/storage/all-storage',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/ca/storage/all-storage',
                    },
                    size: 'sm',
                    text: 'Shop storage',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-tables',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Declutter in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'a668ce8b-df2a-4f20-8f1a-c2ba365fbc4f',
                image: [
                  {
                    alt: 'A wooden coffee table with a rounded edge and performance fabric seats placed in a living room surrounded by Christmas decor..',
                    _uid: 'd72ce634-cdc1-47a1-9ed4-a7a052bc7300',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/4_huggcoffeetable.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/4_huggcoffeetable.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1765182486/marketing/CA/Secondary%20Widgets/4_huggcoffeetable.png',
                  },
                ],
                button: [
                  {
                    _uid: '733738f4-23e7-445f-a3f6-95d319b71e66',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/ca/tables/all-tables',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/ca/tables/all-tables',
                    },
                    size: 'sm',
                    text: 'Shop tables',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-storage',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gather round in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
            ],
            button: [
              {
                _uid: '76a543c5-108b-41cc-9f28-8e132f0654b3',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/ca/all-products',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/ca/all-products',
                },
                size: 'sm',
                text: 'Shop now',
                color: '',
                variant: 'secondary',
                component: 'button',
                text_color: '',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-all-products',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header: '',
            component: 'Hover Listing V2',
            direction: 'vertical',
            background: '#F6F3E7',
            header_color: '#3C101E',
            header_level: 'h2',
            hover_status: true,
            header_position: 'left',
          },
          {
            _uid: 'dce8877d-d5ce-48e8-b1c5-0cc6e1746c77',
            link: [],
            image: [],
            button: [
              {
                _uid: '96ed8346-1059-4a1d-aa0d-428f8ed490c5',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/ca/shop-the-look/living-room',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/ca/shop-the-look/living-room',
                },
                size: 'sm',
                text: 'View all',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                end_decorator: '',
                tracking_label: 'hp-shop-the-look',
                klaviyo_form_id: '',
                start_decorator: '',
              },
            ],
            header: 'Shop the look',
            component: 'Link Banner',
            whole_link: false,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      text: 'Thoughtfully made by people who live in homes, too. That’s why you love them so much.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#000000',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            background_color: '#3C101E',
          },
          {
            _uid: 'a4722cc5-f9ef-4493-a7e4-10c8b964e628',
            items: [
              {
                _uid: '85426c9d-3de0-489d-8203-5babdd254c70',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686949/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_6.png',
                hotspots: [
                  {
                    x: '16',
                    y: '12',
                    _uid: '1ecda397-6bc9-4206-93ac-33c7c9c8c9aa',
                    name: 'Solari',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26537',
                  },
                  {
                    x: '3',
                    y: '13',
                    _uid: '910b09cd-30b6-4e4b-b16f-a74490d9c433',
                    name: 'Fable',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27013',
                  },
                  {
                    x: '8',
                    y: '14',
                    _uid: '939ba053-cd78-4adc-88e4-269096f3f6c2',
                    name: 'Elio side',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23091',
                  },
                  {
                    x: '15',
                    y: '17',
                    _uid: 'fdfe38af-e27a-40e6-9fea-6a2d1c63d75e',
                    name: 'Elio coffee',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23089',
                  },
                  {
                    x: '10',
                    y: '3',
                    _uid: '198a4f05-b9b0-49f6-8ea1-6835023fa459',
                    name: 'Arcadia',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '27167',
                  },
                  {
                    x: '7',
                    y: '18',
                    _uid: 'a0a7d23d-addd-41e5-84de-d4462a9f1285',
                    name: 'Claudia',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26350',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Solari',
              },
              {
                _uid: '2f796d50-e050-44eb-851b-9b4de22c3530',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686927/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_5.png',
                hotspots: [
                  {
                    x: '11',
                    y: '6',
                    _uid: 'db2e7e5f-a026-4014-909e-556f03e3857d',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '26126',
                  },
                  {
                    x: '5',
                    y: '15',
                    _uid: '3dd37e83-ae52-4461-b327-5f76a78c2726',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25656',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper Dining',
              },
              {
                _uid: '2f500bfd-8396-494d-83aa-7a3dfc6f09dc',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686935/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_7.png',
                hotspots: [
                  {
                    x: '11',
                    y: '9',
                    _uid: '9570f684-670d-458d-8a15-82c6d08a12f5',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27057',
                  },
                  {
                    x: '4',
                    y: '11',
                    _uid: 'd06a11de-e9f5-4595-8cd9-e05e8d3667cf',
                    name: 'Harper dresser',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25653',
                  },
                  {
                    x: '10',
                    y: '18',
                    _uid: '1de73866-020f-48d7-811e-4b3f18d77b66',
                    name: 'Nola Area Rug',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25810',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper bed',
              },
              {
                _uid: '66ef287e-288b-4375-be69-cb43dca49a70',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686952/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_4.png',
                hotspots: [
                  {
                    x: '12',
                    y: '9',
                    _uid: '0bbd99ce-b07f-4b84-ab1b-af2bc064707f',
                    name: 'Agnes',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27632',
                  },
                  {
                    x: '18',
                    y: '7',
                    _uid: 'aa215bed-0e2b-4cfa-a502-57b9e9868b99',
                    name: 'Blanc',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25603',
                  },
                  {
                    x: '18',
                    y: '12',
                    _uid: '2359e9a4-93ec-4688-a4cf-f0f47284bd56',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25845',
                  },
                  {
                    x: '11',
                    y: '17',
                    _uid: '247a8830-5f41-422d-834a-8571de0d8ff5',
                    name: 'Claudia',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25813',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Agnes',
              },
              {
                _uid: '13c60232-a2d7-4b31-8b66-37c7c581800b',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686925/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_3.png',
                hotspots: [
                  {
                    x: '5',
                    y: '13',
                    _uid: 'ac3c2b4c-6699-4561-b922-01776d1d4a4b',
                    name: 'Lira dining chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '27192',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Lira',
              },
              {
                _uid: '4ea6df9c-294d-4373-b8a8-d0afdbf25f61',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686958/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_8.png',
                hotspots: [
                  {
                    x: '6',
                    y: '13',
                    _uid: 'ce478981-882b-4758-bacd-bc4170bf0ad1',
                    name: 'Jaron',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '25958',
                  },
                  {
                    x: '15',
                    y: '14',
                    _uid: '60414131-9467-4c06-9d1c-8da10e51eed2',
                    name: 'Wayne',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '19706',
                  },
                  {
                    x: '12',
                    y: '17',
                    _uid: 'cffc573e-4862-41e5-ac14-7fa39432cedb',
                    name: 'Duncan',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23026',
                  },
                  {
                    x: '10',
                    y: '13',
                    _uid: '2cbd6de6-ae66-4822-aef0-7d9cc19a2392',
                    name: 'Elio coffee table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23089',
                  },
                  {
                    x: '8',
                    y: '12',
                    _uid: '29cf6848-7bd0-4514-a083-5553f0b42ef0',
                    name: 'Elio side table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23091',
                  },
                  {
                    x: '18',
                    y: '7',
                    _uid: '853194a0-4355-41ac-a6c8-b672d9e347d8',
                    name: 'Arcadia',
                    type: '',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '26126',
                  },
                  {
                    x: '8',
                    y: '16',
                    _uid: '99ed3812-4acb-4e51-abb4-40d33c936f13',
                    name: 'Muna Area Rug',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24446',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Jaron',
              },
              {
                _uid: '020bfe94-e11e-4fe0-a5af-c1402c1d095e',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686940/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_1.png',
                hotspots: [
                  {
                    x: '11',
                    y: '10',
                    _uid: 'e84f3251-d3b7-46a2-989b-026c18a086bf',
                    name: 'Sloane',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22037',
                  },
                  {
                    x: '7',
                    y: '18',
                    _uid: 'ee2e4e65-1d57-4d55-b4e6-169c18f85b59',
                    name: 'Cora Rug',
                    popup: 'right',
                    component: 'hotspot',
                    variant_id: '23333',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Sloane',
              },
              {
                _uid: 'f9355be7-6a06-4900-a749-18ac28d707a8',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686943/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_2.png',
                hotspots: [
                  {
                    x: '12',
                    y: '9',
                    _uid: '398f5ca3-811c-4dcd-8ed6-dbc7157710c5',
                    name: 'Dawson sofa',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22609',
                  },
                  {
                    x: '7',
                    y: '14',
                    _uid: '5f77924e-1dae-4e98-a480-02da2a810ec6',
                    name: 'Bradley Coffee table',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24024',
                  },
                  {
                    x: '18',
                    y: '8',
                    _uid: '54e80ab8-f7de-40d7-a070-bfdc63492f11',
                    name: 'Nadia lamp',
                    type: '',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '25616',
                  },
                  {
                    x: '16',
                    y: '17',
                    _uid: '9b125436-a12a-46d5-a212-da603070045b',
                    name: 'Ingrid',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21071',
                  },
                  {
                    x: '14',
                    y: '3',
                    _uid: 'afe8401f-bea3-46aa-944f-bc8835c194b7',
                    name: 'Nadine',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '24389',
                  },
                  {
                    x: '3',
                    y: '18',
                    _uid: 'd65b317d-2c81-48e6-90e4-5c16686a309b',
                    name: 'Cora Rug',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '23333',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Dawson',
              },
            ],
            component: 'Shop The Look List',
            show_view_all_products: false,
          },
          {
            _uid: '6bba845b-0d57-4e25-9903-f31fefdf927c',
            component: 'Recommendation Carousel',
            selector_name: 'HP Recommendation #1',
          },
          {
            _uid: '5c15485f-60f3-407a-b096-515c3603ceaf',
            link: [
              {
                url: 'https://www.castlery.com/ca/press',
                _uid: '6cd5d8d7-54c6-4aac-ae8f-37cd1895ef81',
                text: 'Press',
                component: 'Link V2',
                text_color: '#fff',
              },
            ],
            image: [
              {
                alt: '',
                _uid: '67876dea-6164-4e59-9e93-d04c9a60337c',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507484/NEW%20Homepage/AU_Press/AU_Press_v2_Mobile.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507511/NEW%20Homepage/US%20Press/US_Press_v2_Desktop.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507511/NEW%20Homepage/US%20Press/US_Press_v2_Desktop.png',
              },
            ],
            button: [],
            header: '',
            component: 'Link Banner',
            whole_link: true,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '#FFFFFF',
            header_level: 'h2',
            background_color: '',
          },
          {
            _uid: 'af757bc8-204d-4707-b6f6-67c2cb4c2cfe',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'See our designs in real homes ',
                      type: 'text',
                    },
                    {
                      text: '@castleryca',
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://www.instagram.com/castleryca/',
                            uuid: null,
                            anchor: null,
                            target: '_self',
                            linktype: 'url',
                          },
                        },
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#A45B37',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: 'c14120ad-a1ac-4d18-82c8-bdbad6cec58b',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DPaSddRDI0i/​',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DPaSddRDI0i/​',
                },
                image: [
                  {
                    alt: 'A woman hugging her child while seated on a performance bouclé curved sofa.',
                    _uid: 'f0494f2a-d20d-4cb3-a3e3-7749249f1550',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097257/marketing/US/Social%20Widget/HP_ugc1_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'The bouclé on Marlow is so plush, it’s the kind of cozy that lulls your little one to sleep mid-sentence while you stay curled up beside them, completely content. Because honestly, the laundry can wait, but moments like this are non-negotiable.\n\nIn the spotlight: Marlow Performance Bouclé Curve Sofa\nPhotography: @withsarale',
                creator: '@withsarale',
                component: 'ugc-listing',
                product_list: '21241',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@withsarale',
                          type: 'text',
                          marks: [
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#000000',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'c4396dc4-8358-4b5b-bb34-7c3d78e28644',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DOhmEOvk2LX/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DOhmEOvk2LX/',
                },
                image: [
                  {
                    alt: 'A person sitting with her arm propped up against the backrest of a wooden chair.',
                    _uid: '774ab198-bebd-4dee-b20d-e1d1da2a0de3',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc3_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'Layer warmth into your home with earth-toned pieces that bring coziness and character to your living space.\n\nFrom the wood accents of the Anya Dining Chair and the Serena Floor Mirror, to the decadent brown Damascus marble on the Elio Side Table — these pieces don’t just warm up a room, they make it feel lived-in and loved.\n\nIn the spotlight: Anya Dining Chair, Serena Floor Mirror, Elio Side Table, Philippe Accent Chair\nPhotography: @alyssainthecity',
                creator: '@alyssainthecity',
                component: 'ugc-listing',
                product_list: '27163',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@alyssainthecity',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '09f7f2f4-15b2-4feb-bd4c-1b024e18710a',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DNHMqUQM7Tg/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DNHMqUQM7Tg/',
                },
                image: [
                  {
                    alt: 'A woman sitting on the edge of a lift-up storage bed while packing bedlinen.',
                    _uid: 'c85f1f3b-e104-4ec0-b2ea-edfadd98704d',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc4_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  "The Dawson doesn’t just hide your storage, it does so effortlessly. The bed's seamless, concealed function keeps your space sleek and your essentials stylishly stashed in a moment's notice.\n\nIn the spotlight: Dawson Storage Bed, Mika Side Table, Cora Wool Area Rug \nPhotography: @raffaela.sofia",
                creator: '@raffaela.sofia',
                component: 'ugc-listing',
                product_list: '23369',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@raffaela.sofia',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '7c52f38f-a2de-41aa-928a-a8b708cc0b7e',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryca/p/DOs9RoDjvT2/?img_index=1',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryca/p/DOs9RoDjvT2/?img_index=1',
                },
                image: [
                  {
                    alt: 'A dog sitting in front of a white chaise sectional sofa.',
                    _uid: '76c1014e-e2ba-4643-b03b-69b11482c685',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100388/marketing/CA/Social%20Widgets/HP_CA_ugc2.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100388/marketing/CA/Social%20Widgets/HP_CA_ugc2.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100388/marketing/CA/Social%20Widgets/HP_CA_ugc2.jpg',
                  },
                ],
                video: [],
                content:
                  'With its deep seats and sink-in plushness, Hamilton offers plenty of room for you, your pet, and long hours of weekend lounging—especially in a home that wraps you in the warmth and charm of a cozy cottage, just like this one.\n\nIn the spotlight: Hamilton Chaise Sectional Sofa, Harper Side Table, Aria Arch Floor Mirror\nPhotography: @cottagerenovationcwmrhys',
                creator: '@cottagerenovationcwmrhys',
                component: 'ugc-listing',
                product_list: '27435',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@cottagerenovationcwmrhys',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'e90b326b-c675-45bf-b7f4-1f63228d41c7',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/castleryus/p/DJiJLrkTD__/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/castleryus/p/DJiJLrkTD__/',
                },
                image: [
                  {
                    alt: 'A woman hugging her children while playing on a bed.',
                    _uid: '7c257f2e-869f-4122-9554-666131d73a86',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761097256/marketing/US/Social%20Widget/HP_ugc5_castlery.jpg',
                  },
                ],
                video: [],
                content:
                  'She raised us, fed us, and probably let us jump on the sofa more times than she’d admit. Today’s for her, happy Mother’s Day to the real CEO of the house. How are you celebrating her today?\n\nIn the spotlight: Dawson Pit-Sectional Sofa, Harper Marble TV Unit, Hamilton 3 Seater Sofa, Dawson Bed, \nMadison Leather 3 Seater Sofa \nPhotography: @kerenswan , @kathryndenny , @sonelymateo , @kathrynchristi , @a.freckled.fawn.design',
                creator: '@kerenswan',
                component: 'ugc-listing',
                product_list: '22605',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@kerenswan',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'f8e6770e-f06e-4bba-a4e5-a8437f4860be',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DIUu4sCMbXc/?img_index=2',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DIUu4sCMbXc/?img_index=2',
                },
                image: [
                  {
                    alt: 'A white 3-seater sofa placed against a wall with a painting hanging above.',
                    _uid: '15147bde-e466-4434-b264-7d33e365d233',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100181/marketing/CA/Social%20Widgets/HP_CA_ugc1.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100181/marketing/CA/Social%20Widgets/HP_CA_ugc1.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761100181/marketing/CA/Social%20Widgets/HP_CA_ugc1.jpg',
                  },
                ],
                video: [],
                content:
                  'Small home essentials: a comfortable white sofa, stylish boucle swivel chairs, and a versatile sideboard. These pieces create a chic and functional space, no matter the square footage.⁠\n⁠\nIn the spotlight: Hamilton Sofa, Amber Bouclé Swivel Chairs, Sloane Sideboard⁠\nPhotography: @lindseypedey⁠\n⁠\nShop via the link in bio',
                creator: '@lindseypedey',
                component: 'ugc-listing',
                product_list: '27547',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@lindseypedey',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            header: '#AtHomewithCastlery',
            component: 'Social UGC',
            header_color: '#3C101E',
            nums_in_line: '6',
            background_color: '#F6F3E7',
            navigation_display: true,
          },
          {
            _uid: '2472c76b-482f-4755-83e6-9e52f52e89d5',
            size: 'medium',
            image: [
              {
                alt: 'A group of people sitting around a dining table lined with food while clinking their glasses.',
                _uid: '50501b37-6cea-4368-8a79-f51a93ae969f',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Mobile-780x1200.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
              },
            ],
            video: [],
            button: [
              {
                _uid: '15063cf4-1e84-4fd1-90ac-79b4f5cea441',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/ca/our-story',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/ca/our-story',
                },
                text: 'Read our story',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-our-story',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header:
              "A good piece of furniture opens your eyes to the spaces you already have, and all the life that's waiting to be lived in them.",
            bg_color: '',
            component: 'full-width-banner',
            sub_header: '',
            text_align: 'center',
            anchor_link: '',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            sub_header_color: '#F6F3E7',
            sub_header_level: '',
            klaviyo_signup_form: [],
            banner_selector_name: '',
          },
          {
            _uid: 'cd30c59f-4165-49b9-a0b8-b206e371fc01',
            items: [
              {
                _uid: '82b9c689-ba03-4da9-b7f5-ae8420ef50cb',
                image: [],
                video: [],
                header: 'Who are we?',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Born in Singapore in 2013, we design furniture that lives with you—and gets better with time.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'We obsess over the details most people overlook: the warmth of real teak, the cool elegance of marble, the curve of a chair that just feels right. Every piece is made to last, not just in form but in feeling—functional, timeless, and ready to grow with you through life’s messes, milestones, and everything in between.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Learn more about us',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/ca/our-story',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' or better yet, ',
                          type: 'text',
                        },
                        {
                          text: 'see why our customers love our home furniture',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/ca/reviews',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '687aac37-9a21-4a1b-a141-6ec9e0cc466f',
                image: [],
                video: [],
                header: 'What types of modern furniture can you find here? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Explore our range of thoughtfully designed furniture for every room in your home.',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Living room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/ca/furniture-sets/living-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Our sofas, armchairs, coffee tables, and storage pieces are made for lounging, gathering, and stealing the spotlight—without shouting for it.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Bedroom furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/ca/furniture-sets/bedroom-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': From sturdy bed frames to sleek nightstands and dressers, our bedroom pieces are crafted for comfort and calm.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Outdoor & patio furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/ca/furniture-sets/outdoor-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Built with weather-resistant materials and timeless appeal, our outdoor collection is made to handle the elements—and the impromptu BBQ.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Dining room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/ca/furniture-sets/dining-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Tables that host; Chairs that stay comfortable through dessert. Our dining table sets are functional, elegant, and built for everything from weeknight takeout to celebratory spreads.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Home accessories',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/ca/accessories/all-accessories',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Rugs, mirrors, lighting, and more—our accessories are the finishing touches that pull it all together. Consider them your space’s secret sauce.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: ' ',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For a fuss-free online shopping experience, we’ve curated ',
                          type: 'text',
                        },
                        {
                          text: 'furniture bundles',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/ca/sale/bundle-sale',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' just for you. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'With just a click, get matching furniture sets for any space in your home.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '516481f9-3419-41f6-9400-0d38132d83fa',
                image: [],
                video: [],
                header: 'I need help designing & styling my home – is there a tool that I can use? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'With ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery’s Room Designer Tool',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/ca/room-designer',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ', you can plan your furniture layout, mix and match pieces, and see exactly how everything fits—before you buy. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'It’s the easiest way to design a functional, beautiful space that works for real life.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Looking for ideas? Get inspired by the latest home decor trends, styling tips, and design guides on the ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery Blog',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/ca/blog',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'From material deep-dives to space-saving tricks, it’s your go-to for creating a home that feels like you.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'bee698c2-9a5b-4aaa-aa36-abeebb4ce420',
                image: [],
                video: [],
                header: 'Need help with shipping, delivery, and warranties? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'We strive to make your Castlery experience seamless—from browsing and checkout to delivery and everyday living. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Here are some perks when you shop with us:',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'We offer three types of delivery options – Standard, Room of Choice, or White Glove.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy 30-day easy returns.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For more details on orders, shipping, returns, or product care, head over to our ',
                          type: 'text',
                        },
                        {
                          text: 'Help Center',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/us/help-center',
                                uuid: null,
                                anchor: null,
                                target: null,
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Because bringing beautiful furniture home should feel as good as it looks.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
            ],
            header: 'Shop Online Furniture Store with Modern Designs',
            component: 'Accordion',
            header_color: '#3C101E',
            has_faq_schema: false,
            background_color: '#F6F3E7',
          },
          {
            _uid: '3c1ad1fa-3a71-48c0-a079-e775266bf0e1',
            size: 'medium',
            component: 'section-break',
          },
        ],
        meta: [
          {
            _uid: '789af7b7-382f-46aa-82af-c909bbc34c4a',
            title: 'Modern Furniture Store Online',
            keywords:
              'furniture Canada, online furniture Canada, furniture shop Canada, furniture stores Canada, furniture in Canada, modern furniture Canada, furniture CA, furniture, Castlery, Canada',
            component: 'meta-data',
            description:
              'Shop modern and contemporary furniture online in Canada. Find plush sofas, tables, beds & more. Enjoy 30-day easy returns - Shop now!',
            notIndexable: false,
            structure_data:
              '{"@context": "http://schema.org","@type": "WebSite","url": "https://www.castlery.com/ca/","name": "Castlery","potentialAction": {"@type": "SearchAction","target": "https://www.castlery.com/ca/search?q={search_term_string}","query-input": "required name=search_term_string"}}',
          },
        ],
        timer: [],
        component: 'page',
        breadcrumb: '',
        breadcrumbs: '',
        redirect_url: '',
      },
      slug: 'home-page-brand-refresh',
      full_slug: 'ca/general-content-v2/main-pages/home-page-brand-refresh',
      sort_by_date: null,
      position: -430,
      tag_list: [],
      is_startpage: false,
      parent_id: 79405292524062,
      meta_data: null,
      group_id: 'f2397adc-1243-424e-900f-9829c1c4231a',
      first_published_at: '2025-10-20T09:09:35.112Z',
      release_id: null,
      lang: 'default',
      path: 'ca',
      alternates: [],
      default_full_slug: null,
      translated_slugs: null,
    },
    lastUpdated: '2025-12-10T10:03:20.362Z',
    note: 'Fallback data for CA home-page-brand-refresh. Updated: 12/10/2025, 6:03:20 PM',
  },
  uk: {
    value: {
      name: 'Home Page Brand Refresh',
      created_at: '2025-09-19T06:19:05.147Z',
      published_at: '2025-12-04T08:01:31.645Z',
      updated_at: '2025-12-04T08:01:31.681Z',
      id: 92459602561277,
      uuid: 'bc8a6427-aa83-40ad-9a0b-632df111c8e7',
      content: {
        _uid: '15ab4237-088e-4950-b55b-3a94d16c0a37',
        body: [
          {
            _uid: 'd93fed7c-fc2f-4818-80a8-7e7dbabba07e',
            items: [
              {
                _uid: 'b810e566-af3c-4149-aed9-af9d652537a5',
                size: 'large',
                image: [],
                video: [
                  {
                    _uid: '0e04e892-2a72-4821-9481-6e8b2b648808',
                    mute: true,
                    autoplay: true,
                    controls: false,
                    component: 'video',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683580/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_MOBILE.mp4',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/video/upload/v1760683584/marketing/US/Homepage/USCA_EVERGREEN_30_OURSTORY_DESKTOP.mp4',
                  },
                ],
                button: [
                  {
                    _uid: 'af166d95-5cf7-4ada-a9ed-c89158d2a4f5',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/uk/new',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/uk/new',
                    },
                    size: 'sm',
                    text: 'Discover our designs',
                    color: '#F6F3E7',
                    variant: 'secondary',
                    component: 'button',
                    text_color: '#F6F3E7',
                    end_decorator: '',
                    tracking_label: 'hp-hero-s3',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gets better with living',
                bg_color: '#F6F3E7',
                component: 'full-width-banner',
                sub_header: '',
                text_align: 'center',
                anchor_link: '',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                    },
                  ],
                },
                header_color: '#F6F3E7',
                header_level: 'h1',
                enlarge_header: true,
                sub_header_color: '#F6F3E7',
                sub_header_level: 'h2',
                klaviyo_signup_form: [],
                banner_selector_name: 'HP Banner',
              },
            ],
            component: 'Hero',
          },
          {
            _uid: '27073e19-8efa-4191-bae1-2e36f8e4cebd',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'Every festive detail finds its place when your space is perfectly set for the season. Explore designs that bring just the right touch of sparkle—and get your home styled for the holidays.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#834024',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: '2498d270-9e91-4a80-b135-b884e3203b20',
                image: [
                  {
                    alt: 'A leather sofa and a performance fabric armchair placed in a living room.',
                    _uid: '1ea205b4-665a-4fed-a1b2-b07421f4d897',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/1_Sofa.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/1_Sofa.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686741/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/1_Sofa.png',
                  },
                ],
                button: [
                  {
                    _uid: '32e005eb-190e-466e-bbf2-c673e40bd487',
                    link: {
                      id: '',
                      url: 'sofas/all-sofas',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'sofas/all-sofas',
                    },
                    size: 'sm',
                    text: 'Shop sofas',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-sofas',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Get together in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '95018821-8d3d-406e-b916-5b5b1e8fdbeb',
                image: [
                  {
                    alt: 'A wooden bed with a wingback headboard placed in a bedroom.',
                    _uid: 'a72ffd6e-9c3b-420a-b45e-b958fe054385',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686748/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/2_Bed.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686748/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/2_Bed.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686748/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/2_Bed.png',
                  },
                ],
                button: [
                  {
                    _uid: 'c38b807f-efcc-44a8-b431-ca15e634cd2e',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/uk/beds/all-bedroom',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/uk/beds/all-bedroom',
                    },
                    size: 'sm',
                    text: 'Shop beds',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-bed',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Rest easy in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: 'f4af5c07-cb26-4ba6-94dd-cce2ba63315f',
                image: [
                  {
                    alt: 'A 6-drawer dark wood dresser with brass handles.',
                    _uid: 'f1cb2a5a-86e4-4662-890d-5797bb39ce03',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686746/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/3_Storage.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686746/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/3_Storage.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686746/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/3_Storage.png',
                  },
                ],
                button: [
                  {
                    _uid: '9805223a-c2bf-4b93-aaf6-66938c47e6f6',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/uk/storage/all-storage',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/uk/storage/all-storage',
                    },
                    size: 'sm',
                    text: 'Shop storage',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-storage',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Declutter in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
              {
                _uid: '2c5486d2-9465-4fca-b1ea-dd729ba12dce',
                image: [
                  {
                    alt: 'A wooden dining table with a rounded edge and performance fabric dining chairs placed in a dining room.',
                    _uid: '564e6e4f-8c2c-478f-8c26-1694d564aba1',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686740/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/4_Tables.png',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686740/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/4_Tables.png',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1760686740/NEW%20Homepage/Brand%20Refresh%20V2%20Secondary%20Banner/USCAUK/4_Tables.png',
                  },
                ],
                button: [
                  {
                    _uid: '6490a29b-cb2a-4a58-b67e-81457a45de55',
                    link: {
                      id: '',
                      url: 'https://www.castlery.com/uk/tables/all-tables',
                      linktype: 'url',
                      fieldtype: 'multilink',
                      cached_url: 'https://www.castlery.com/uk/tables/all-tables',
                    },
                    size: 'sm',
                    text: 'Shop tables',
                    color: '#F6F3E7',
                    variant: 'primary',
                    component: 'button',
                    text_color: '#3C101E',
                    end_decorator: '',
                    tracking_label: 'hp-all-tables',
                    klaviyo_form_id: '',
                    start_decorator: '',
                  },
                ],
                header: 'Gather round in style',
                component: 'Hover Vertical Card',
                header_color: '#F6F3E7',
                header_level: 'h2',
              },
            ],
            button: [
              {
                _uid: '86ad69f3-85d2-44e8-81df-4383d73e2a59',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/uk/all-products',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/uk/all-products',
                },
                size: 'sm',
                text: 'Shop now',
                color: '',
                variant: 'secondary',
                component: 'button',
                text_color: '',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-all-products',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header: '',
            component: 'Hover Listing V2',
            direction: 'vertical',
            background: '#F6F3E7',
            header_color: '#3C101E',
            header_level: 'h2',
            hover_status: true,
            header_position: 'left',
          },
          {
            _uid: '67bca04c-8a09-4a74-8dec-0c140931f7aa',
            link: [],
            image: [],
            button: [
              {
                _uid: 'ffb4c694-2d3c-4c03-bc0e-c36244488be7',
                link: {
                  id: '',
                  url: 'shop-the-look/living-room',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'shop-the-look/living-room',
                },
                size: 'sm',
                text: 'View all',
                variant: 'secondary',
                component: 'button',
                text_color: '#FFFFFF',
                end_decorator: '',
                tracking_label: 'hp-shop-the-look',
                klaviyo_form_id: '',
                start_decorator: '',
              },
            ],
            header: 'Shop the look',
            component: 'Link Banner',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      text: 'Thoughtfully made by people who live in homes, too. That’s why you love them so much.',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '',
                          },
                        },
                      ],
                    },
                    {
                      text: '​',
                      type: 'text',
                      marks: [
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#000000',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            background_color: '#3C101E',
          },
          {
            _uid: '8803a772-64a4-4f8d-9f65-cb9ff5d51704',
            items: [
              {
                _uid: 'ded05ec3-40b1-4f3d-9488-12a7db0b07a0',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686910/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Desktop%20-%20STL%20Page/Desktop_-_STL_Page_6.png',
                hotspots: [
                  {
                    x: '16',
                    y: '12',
                    _uid: '112acb18-4fe1-4cda-a038-871e99564e3d',
                    name: 'Solari',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24598',
                  },
                  {
                    x: '3',
                    y: '13',
                    _uid: '596f9830-9350-41ce-b837-d80ae607d93f',
                    name: 'Fable',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24581',
                  },
                  {
                    x: '8',
                    y: '14',
                    _uid: 'efc4297e-9339-4bf5-af29-05d75756954e',
                    name: 'Elio side',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21977',
                  },
                  {
                    x: '15',
                    y: '18',
                    _uid: 'a2c02e83-81d1-485e-8c53-825516c3d343',
                    name: 'Elio coffee',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21979',
                  },
                  {
                    x: '10',
                    y: '3',
                    _uid: 'e2a1b7f2-65c8-44df-a047-e4535ef577a4',
                    name: 'Arcadia',
                    type: '',
                    popup: 'below',
                    component: 'hotspot',
                    variant_id: '24829',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Solari',
              },
              {
                _uid: '0dd92ca0-0742-4867-b433-916f8910c65f',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686927/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_5.png',
                hotspots: [
                  {
                    x: '11',
                    y: '6',
                    _uid: '44b525a7-a37f-4ea6-8746-bc4b2762d949',
                    name: 'Arcadia',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '24811',
                  },
                  {
                    x: '5',
                    y: '15',
                    _uid: 'e8a4ac29-96c0-437a-9835-2c0d578d4358',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '22360',
                  },
                  {
                    x: '9',
                    y: '14',
                    _uid: '0e751897-4045-40a9-b572-4e4cdf81669f',
                    name: 'Sloane chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '19829',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper Dining',
              },
              {
                _uid: 'ac4acf5b-1ca1-4a0d-9715-3e9e5c6cd834',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686935/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_7.png',
                hotspots: [
                  {
                    x: '11',
                    y: '9',
                    _uid: '1d4654d3-e4d5-48f2-935c-7f37d7465398',
                    name: 'Harper',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24549',
                  },
                  {
                    x: '4',
                    y: '11',
                    _uid: '6708be5e-68fe-4245-b9a4-7be33cedf6fd',
                    name: 'Harper dresser',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24355',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Harper bed',
              },
              {
                _uid: '06ef11a5-2730-4c92-b325-4cd2ce00abfc',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686917/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Desktop%20-%20STL%20Page/Desktop_-_STL_Page_3.png',
                hotspots: [
                  {
                    x: '5',
                    y: '13',
                    _uid: '64f60ac0-eb2b-4d4f-817c-8499973a086b',
                    name: 'Lira dining chair',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26479',
                  },
                  {
                    x: '9',
                    y: '7',
                    _uid: '968fc2cb-401c-4c84-9f9e-7400aca7a4be',
                    name: 'Cascade',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '24898',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Lira',
              },
              {
                _uid: '9954cb3e-0358-448d-bd96-86e3de7f4721',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686958/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Homepage/Homepage_8.png',
                hotspots: [
                  {
                    x: '6',
                    y: '13',
                    _uid: '7f12fa6e-56b4-4db9-b1c6-669b4cf83077',
                    name: 'Jaron',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26704',
                  },
                  {
                    x: '15',
                    y: '14',
                    _uid: '71a9e8bf-4e9b-400a-8741-c35eab3de507',
                    name: 'Wayne',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '18412',
                  },
                  {
                    x: '13',
                    y: '17',
                    _uid: '3576f070-0a46-4227-916e-a41e70143e45',
                    name: 'Duncan',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21953',
                  },
                  {
                    x: '11',
                    y: '14',
                    _uid: 'ab2e3757-7ead-4202-813b-9378be646447',
                    name: 'Elio coffee table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21977',
                  },
                  {
                    x: '9',
                    y: '12',
                    _uid: '7bdbb67d-dbd3-4671-b48a-7ddef681db46',
                    name: 'Elio side table',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21979',
                  },
                  {
                    x: '19',
                    y: '7',
                    _uid: 'c4412369-dbc0-474d-9509-b00d718ee92e',
                    name: 'Arcadia',
                    type: '',
                    popup: 'left',
                    component: 'hotspot',
                    variant_id: '24811',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Jaron',
              },
              {
                _uid: 'bd6c542b-e06e-436b-9334-30585a68e53b',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686925/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Desktop%20-%20STL%20Page/Desktop_-_STL_Page_1.png',
                hotspots: [
                  {
                    x: '11',
                    y: '10',
                    _uid: '876bf6ae-8e99-46cd-883c-b6c8c48bdcd1',
                    name: 'Sloane',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '26651',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Sloane',
              },
              {
                _uid: 'a96ceac1-57a2-47cf-9ef6-33e836c103fa',
                tips: [],
                image:
                  'https://res.cloudinary.com/castlery/image/upload/v1760686919/NEW%20Homepage/Brand%20Refresh%20V2%20STL/SG_US_UK_CA/Desktop%20-%20STL%20Page/Desktop_-_STL_Page_2.png',
                hotspots: [
                  {
                    x: '12',
                    y: '9',
                    _uid: '7cbfb5a3-bb2f-4c81-90ca-5f32e97205a2',
                    name: 'Dawson sofa',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '21628',
                  },
                  {
                    x: '16',
                    y: '18',
                    _uid: '962035df-e273-485b-8d99-e0f96a771846',
                    name: 'Ingrid',
                    type: '',
                    popup: 'above',
                    component: 'hotspot',
                    variant_id: '19767',
                  },
                ],
                component: 'Shop The Look Item',
                look_name: 'Dawson',
              },
            ],
            component: 'Shop The Look List',
            show_view_all_products: false,
          },
          {
            _uid: 'f60bdb0c-463f-4208-a941-cec6d6c978dd',
            component: 'Recommendation Carousel',
            selector_name: 'HP Recommendation #1',
          },
          {
            _uid: '2e1c920b-5559-481b-ade5-1636f86a80d5',
            link: [
              {
                url: 'https://www.castlery.com/uk/press',
                _uid: '6ae9a107-0d12-48d0-ac5d-2643cb4e482f',
                text: '',
                component: 'Link V2',
                text_color: '',
              },
            ],
            image: [
              {
                alt: '',
                _uid: '0c5cc4dd-9473-4299-8852-2e66f642ae1a',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507537/NEW%20Homepage/UK%20Press/UK_Press_v2_Mobile.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507536/NEW%20Homepage/UK%20Press/UK_Press_v2_Desktop.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760507536/NEW%20Homepage/UK%20Press/UK_Press_v2_Desktop.png',
              },
            ],
            button: [],
            header: '',
            component: 'Link Banner',
            whole_link: true,
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '',
            header_level: 'h2',
            background_color: '',
          },
          {
            _uid: '75decc4d-aee4-44af-9401-f17e98a4e785',
            text: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    textAlign: null,
                  },
                  content: [
                    {
                      text: 'See our designs in real homes ',
                      type: 'text',
                    },
                    {
                      text: '@castleryuk',
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: 'https://www.instagram.com/castleryuk/',
                            uuid: null,
                            anchor: null,
                            target: '_self',
                            linktype: 'url',
                          },
                        },
                        {
                          type: 'textStyle',
                          attrs: {
                            color: '#A45B37',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            items: [
              {
                _uid: 'a931dba6-f937-41b6-b6a3-fd853929efc1',
                link: {
                  id: '',
                  url: '​​https://www.instagram.com/p/DNFUO3DqfCe/?hl=en',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: '​​https://www.instagram.com/p/DNFUO3DqfCe/?hl=en',
                },
                image: [
                  {
                    alt: 'A performance fabric curved 3-seater sofa with two paintings with a gold frame placed on the wall above it.',
                    _uid: '30020ee3-8071-45cd-904e-735b46b1fdfd',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035392/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/ashmazzina.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035392/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/ashmazzina.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035392/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/ashmazzina.jpg',
                  },
                ],
                video: [],
                content:
                  'I don’t usually venture too far into modern interiors, but if I did, this would be it. Every piece in this sitting and dining room refresh is from @castleryuk who’ve just launched in the UK and I have to say, it’s exactly the kind of modern I can get behind: clean, calm, and comfortable, blending effortlessly with more traditional interiors.\n\nTheir sale is on, so if anything catches your eye, now’s a good time to explore!',
                creator: '@ashmazzina',
                component: 'ugc-listing',
                product_list: '20159',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@ashmazzina',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: '6576c92f-8afc-4c8a-91da-f97271979969',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DOp2Rj6DPL8/?hl=en',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DOp2Rj6DPL8/?hl=en',
                },
                image: [
                  {
                    alt: 'A white chaise sectional sofa and a wooden rectangular coffee table.',
                    _uid: '8f133710-4305-47b2-a9ad-bc0e4c7a5e62',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035576/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/cottagerenovationcwmrhys.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035576/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/cottagerenovationcwmrhys.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035576/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/cottagerenovationcwmrhys.jpg',
                  },
                ],
                video: [],
                content:
                  'Cosy living room styling with @castleryuk\n\nTheir gorgeous range of timeless furniture and accessories has recently launched in the UK, offering the perfect blend of quality, comfort and style.',
                creator: '@cottagerenovationcwmrhys',
                component: 'ugc-listing',
                product_list: '20177',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@cottagerenovationcwmrhys',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'ee46a920-b752-4e12-91e1-65f58d195b63',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DDCW36Qp84l/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DDCW36Qp84l/',
                },
                image: [
                  {
                    alt: 'A wooden sideboard with a TV mounted on the wall behind it.',
                    _uid: 'f2ccb3af-e717-46a3-ac22-9f42a2003891',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906315/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_ourhighlandshome_5.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906315/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_ourhighlandshome_5.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906315/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_ourhighlandshome_5.jpg',
                  },
                ],
                video: [],
                content:
                  'HAPPY DECEMBER 1st!!! our favorite christmas room in the house. hope you have a magical season. comment SHOP for links to this room & some gift guides 🤎✨🎄 ALL GIFT GUIDES SAVED TO MY LTK \n',
                creator: '@ourhighlandshome',
                component: 'ugc-listing',
                product_list: '19763',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@ourhighlandshome',
                          type: 'text',
                          marks: [
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#242424',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'f88551cd-517b-4456-a088-7259083edeed',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DD7Th08Jqzg/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DD7Th08Jqzg/',
                },
                image: [
                  {
                    alt: 'A wooden dining table with four woven dining chairs.',
                    _uid: '828143ee-a24d-4ed5-869e-f5dc7d806369',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906314/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_maddoxinthemiddle_6.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906314/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_maddoxinthemiddle_6.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759906314/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_maddoxinthemiddle_6.jpg',
                  },
                ],
                video: [],
                content:
                  'Christmas House Tour 🎄\n\n#christmaslights #colorfulchristmas #vintagechristmas #vintagehome #vintageholiday #christmasideas',
                creator: '@maddoxinthemiddle',
                component: 'ugc-listing',
                product_list: '26428, 21480',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          text: '@maddoxinthemiddle',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'f7dd5f48-aa3f-4a18-b425-0ba28b0442fd',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DDINxyCJhkz/',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DDINxyCJhkz/',
                },
                image: [
                  {
                    alt: 'A mindi wood dresser with a Chrismas tree placed beside it.',
                    _uid: 'e7876188-d51b-405b-80e1-4a42fd118c44',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759917447/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_decoratingnewbuild.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759917447/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_decoratingnewbuild.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1759917447/marketing/Cross-Market/Social%20Widget/USCA_2025Holiday_decoratingnewbuild.jpg',
                  },
                ],
                video: [],
                content:
                  'Swipe for my mood today... 🙃 \nFeels like a Monday & I just wanna jump in this bed and call it a day 😂 the days seem long but the months are so short. December always seems to fly by and I’ll sure miss these cozy Christmas views. #christmas #bedroom',
                creator: '@decoratingnewbuild_',
                component: 'ugc-listing',
                product_list: '22317',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@decoratingnewbuild_',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                _uid: 'f38a46a8-5b0d-4803-b5cd-34c073bac160',
                link: {
                  id: '',
                  url: 'https://www.instagram.com/p/DNILoFIsAEK/?hl=en&img_index=6',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.instagram.com/p/DNILoFIsAEK/?hl=en&img_index=6',
                },
                image: [
                  {
                    alt: 'A white sofa and a walnut wood nesting coffee table placed in a living room.',
                    _uid: '5b2b9aff-17c0-40b8-ac16-eaad4c0a8e6b',
                    component: 'image',
                    mobile_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035806/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/hygge_for_home.jpg',
                    tablet_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035806/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/hygge_for_home.jpg',
                    desktop_url:
                      'https://res.cloudinary.com/castlery/image/upload/v1761035806/marketing/UK/Room%20Edits%20%28Social%20UGCs%29/hygge_for_home.jpg',
                  },
                ],
                video: [],
                content:
                  " I’m proud to be introducing @castleryuk to the UK and showcasing a Brand that might be new to you.\n\nHome, for me, has always been about how it feels, calm, comforting, and connected to the way we actually live.\n\nTheir calm, considered approach to design aligns so closely with how I live, write, and create from the objects I design for your home to the spaces I shape. You’ll know by now how passionate I am about interiors that engage the senses and how often I talk about hygge.\n\nThis partnership is a natural continuation of that, a shared commitment to homes that are lived in, timeless, and grounded in tranquillity.\n\nI chose and styled every piece in this room with that in mind, from the natural textures and softness of the Cora Wool Area Rug, to the sculptural form of the floor lamp, the solid wood nest of tables, and a sofa that gently invites you to take a seat.\n\nIf you’re ready to explore and start curating comfort in your own space…Castlery's sale is now live.",
                creator: '@hygge_for_home',
                component: 'ugc-listing',
                product_list: '19991, 20860',
                creator_handle: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: '@hygge_for_home',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            header: '#AtHomewithCastlery',
            component: 'Social UGC',
            header_color: '#3C101E',
            nums_in_line: '6',
            background_color: '#F6F3E7',
            navigation_display: true,
          },
          {
            _uid: 'ad83f7f1-76e1-4a1a-b6a3-7145d59c8d60',
            size: 'medium',
            image: [
              {
                alt: 'A group of people sitting around a dining table lined with food while clinking their glasses.',
                _uid: '16198c4d-a4ba-4f6c-9e98-67b22432d329',
                component: 'image',
                mobile_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Mobile-780x1200.png',
                tablet_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
                desktop_url:
                  'https://res.cloudinary.com/castlery/image/upload/v1760510815/NEW%20Homepage/Homepage-Desktop-1728x675.png',
              },
            ],
            video: [],
            button: [
              {
                _uid: 'f47a44f2-a8b8-4634-8926-38e264e7debb',
                link: {
                  id: '',
                  url: 'https://www.castlery.com/uk/our-story',
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: 'https://www.castlery.com/uk/our-story',
                },
                size: 'sm',
                text: 'Read our story',
                color: '#F6F3E7',
                variant: 'secondary',
                component: 'button',
                text_color: '#F6F3E7',
                estate_name: '',
                end_decorator: '',
                tracking_label: 'hp-our-story',
                klaviyo_form_id: '',
                start_decorator: '',
                need_send_coupon: false,
              },
            ],
            header:
              'A good piece of furniture opens your eyes to the spaces you already have, and all the life that’s waiting to be lived in them.',
            bg_color: '',
            component: 'full-width-banner',
            sub_header: '',
            text_align: 'center',
            anchor_link: '',
            description: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            },
            header_color: '#F6F3E7',
            header_level: 'h2',
            enlarge_header: false,
            sub_header_color: '#F6F3E7',
            sub_header_level: '',
            klaviyo_signup_form: [],
            banner_selector_name: '',
          },
          {
            _uid: '5db6a89d-6a40-49d9-91a7-da11e9c4070e',
            items: [
              {
                _uid: '03276352-a0df-4b3c-a8b0-6d3d48948200',
                image: [],
                video: [],
                header: 'Who are we?',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Born in Singapore in 2013, we design furniture that lives with you—and gets better with time.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'We obsess over the details most people overlook: the warmth of real teak, the cool elegance of marble, the curve of a chair that just feels right. Every piece is made to last, not just in form but in feeling—functional, timeless, and ready to grow with you through life’s messes, milestones, and everything in between.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Learn more about us',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/our-story',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' or better yet, ',
                          type: 'text',
                        },
                        {
                          text: 'see why our customers love our home furniture',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/reviews',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: '8465ff9b-95cc-421c-a587-49761f274355',
                image: [],
                video: [],
                header: 'What types of modern furniture can you find here? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'Explore our range of thoughtfully designed furniture for every room in your home.',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Living room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/uk/furniture-sets/living-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Our sofas, armchairs, coffee tables, and storage pieces are made for lounging, gathering, and stealing the spotlight—without shouting for it.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Bedroom furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/uk/furniture-sets/bedroom-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': From sturdy bed frames to sleek nightstands and dressers, our bedroom pieces are crafted for comfort and calm.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Dining room furniture',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/uk/furniture-sets/dining-room-sets',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Tables that host; Chairs that stay comfortable through dessert. Our dining table sets are functional, elegant, and built for everything from weeknight takeout to celebratory spreads.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Home accessories',
                                  type: 'text',
                                  marks: [
                                    {
                                      type: 'link',
                                      attrs: {
                                        href: 'https://www.castlery.com/uk/accessories/all-accessories',
                                        uuid: null,
                                        anchor: null,
                                        target: '_self',
                                        linktype: 'url',
                                      },
                                    },
                                    {
                                      type: 'textStyle',
                                      attrs: {
                                        color: '#D25C1B',
                                      },
                                    },
                                  ],
                                },
                                {
                                  text: ': Rugs, mirrors, lighting, and more—our accessories are the finishing touches that pull it all together. Consider them your space’s secret sauce.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: ' ',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For a fuss-free online shopping experience, we’ve curated ',
                          type: 'text',
                        },
                        {
                          text: 'furniture bundles',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/sale/bundle-sale',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ' just for you. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'With just a click, get matching furniture sets for any space in your home.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'ad85fd05-3329-4e3d-ad7e-584fe721d8cc',
                image: [],
                video: [],
                header: 'I need help designing & styling my home – is there a tool that I can use? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'With ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery’s Room Designer Tool',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/room-designer',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: ', you can plan your furniture layout, mix and match pieces, and see exactly how everything fits—before you buy. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'It’s the easiest way to design a functional, beautiful space that works for real life.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Looking for ideas? Get inspired by the latest home decor trends, styling tips, and design guides on the ',
                          type: 'text',
                        },
                        {
                          text: 'Castlery Blog',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/blog',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'From material deep-dives to space-saving tricks, it’s your go-to for creating a home that feels like you.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
              {
                _uid: 'eb9216d3-27fb-450e-8d9c-0278db67315e',
                image: [],
                video: [],
                header: 'Need help with shipping, delivery, and warranties? ',
                component: 'Accordion Item',
                description: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          text: 'We strive to make your Castlery experience seamless—from browsing and checkout to delivery and everyday living. ',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Here are some perks when you shop with us:',
                          type: 'text',
                        },
                        {
                          type: 'hard_break',
                        },
                        {
                          type: 'hard_break',
                        },
                      ],
                    },
                    {
                      type: 'bullet_list',
                      content: [
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy free shipping* when your order is over £1099.',
                                  type: 'text',
                                },
                              ],
                            },
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: " * Subjected to Country's region",
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'We offer three types of delivery options – Standard, Room of Choice, or White Glove.',
                                  type: 'text',
                                },
                                {
                                  type: 'hard_break',
                                },
                                {
                                  type: 'hard_break',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'list_item',
                          content: [
                            {
                              type: 'paragraph',
                              attrs: {
                                textAlign: null,
                              },
                              content: [
                                {
                                  text: 'Enjoy 30-day easy returns.',
                                  type: 'text',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'For more details on orders, shipping, returns, or product care, head over to our ',
                          type: 'text',
                        },
                        {
                          text: 'Help Center',
                          type: 'text',
                          marks: [
                            {
                              type: 'link',
                              attrs: {
                                href: 'https://www.castlery.com/uk/help-center',
                                uuid: null,
                                anchor: null,
                                target: '_self',
                                linktype: 'url',
                              },
                            },
                            {
                              type: 'textStyle',
                              attrs: {
                                color: '#D25C1B',
                              },
                            },
                          ],
                        },
                        {
                          text: '.',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: null,
                      },
                      content: [
                        {
                          type: 'hard_break',
                        },
                        {
                          text: 'Because bringing beautiful furniture home should feel as good as it looks.',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
                header_color: '#3C101E',
                seo_description: '',
              },
            ],
            header: 'Shop Online Furniture Store with Modern Designs',
            component: 'Accordion',
            header_color: '#3C101E',
            has_faq_schema: false,
            background_color: '#F6F3E7',
          },
          {
            _uid: 'da7a77ba-4044-4634-9790-8ab99e9b5c3a',
            size: 'medium',
            component: 'section-break',
          },
        ],
        meta: [
          {
            _uid: '806ae205-75f6-4b51-a8de-b4b33f7f69c7',
            title: 'Modern Furniture Store Online',
            keywords:
              'furniture United Kingdom, online furniture United Kingdom, furniture shop United Kingdom, furniture stores United Kingdom, furniture in United Kingdom, modern furniture United Kingdom, furniture UK, furniture, Castlery, United Kingdom',
            component: 'meta-data',
            description:
              'Furniture shopping was always about filling a room with expensive design trends, but we wanted to turn the tables because everyone deserves a space to thrive.',
            notIndexable: false,
            structure_data:
              '{"@context": "http://schema.org","@type": "WebSite","url": "https://www.castlery.com/uk/","name": "Castlery","potentialAction": {"@type": "SearchAction","target": "https://www.castlery.com/uk/search?q={search_term_string}","query-input": "required name=search_term_string"}}',
          },
        ],
        timer: [],
        component: 'page',
        breadcrumb: '',
        redirect_url: '',
      },
      slug: 'home-page-brand-refresh',
      full_slug: 'uk/general-content-v2/main-pages/home-page-brand-refresh',
      sort_by_date: null,
      position: -694535,
      tag_list: [],
      is_startpage: false,
      parent_id: 79415466773358,
      meta_data: null,
      group_id: '9e8a34eb-664a-45c8-9909-ed20e3ae218d',
      first_published_at: '2025-10-14T13:21:44.649Z',
      release_id: null,
      lang: 'default',
      path: 'uk',
      alternates: [],
      default_full_slug: null,
      translated_slugs: null,
    },
    lastUpdated: '2025-12-10T10:03:21.256Z',
    note: 'Fallback data for UK home-page-brand-refresh. Updated: 12/10/2025, 6:03:21 PM',
  },
};
