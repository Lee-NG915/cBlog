/* eslint-disable */
/**
 * Global Nav Fallback Data
 *
 * 这个文件由脚本自动生成，请勿手动编辑
 * 用于 getGlobalNav 方法的 fallback 数据
 * 参考 apps/web/scripts/update-basic-container-resource-fallback.ts 的逻辑
 *
 * @generated
 * @lastUpdated 2025-12-10T10:03:07.155Z
 */

interface FallbackData {
  value: any[];
  lastUpdated: string;
  note: string;
}

/**
 * 各市场的 Global Nav 兜底数据
 * 当 Storyblok API 不可用时使用这些数据
 *
 * Edge Runtime 兼容：数据在编译时打包进 bundle
 *
 * 数据结构对应 getGlobalNav 方法的返回值
 */
export const FALLBACK_GLOBAL_NAV_DATA: Record<string, FallbackData> = {
  sg: {
    value: [
      {
        _uid: '0bf8f83b-2ff9-413a-b50b-803404c2dc49',
        desc: '',
        link: {
          id: '',
          url: '/interior-styling-service',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/interior-styling-service',
        },
        name: 'Interior Styling Service',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
      {
        _uid: 'f6183a27-a06c-465b-8ba2-04fb6d1ba667',
        desc: '',
        link: {
          id: '',
          url: '/showroom',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/showroom',
        },
        name: 'Visit Showroom',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
      {
        _uid: '5574104e-f93c-45d7-8f8e-93ddcbddb764',
        desc: '',
        link: {
          id: '',
          url: '/reviews',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/reviews',
        },
        name: 'Reviews',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
      {
        _uid: 'd438f350-62bc-4764-a8e5-7d4be17b49ad',
        desc: '',
        link: {
          id: '',
          url: '/the-castlery-club',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/the-castlery-club',
        },
        name: 'The Castlery Club',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
      {
        _uid: '11c2d61f-3ef1-42c1-83fc-a48bd4593c38',
        desc: '',
        link: {
          id: '',
          url: '/referral',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/referral',
        },
        name: 'Refer a Friend',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
      {
        _uid: '9ac74bd6-7e4e-4cac-9343-d1d0ad5871c9',
        desc: 'link about contact us',
        link: {
          id: '',
          url: '/contact-us',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/sg/contact-us',
        },
        name: 'Contact Us',
        ended_at: '',
        component: 'link_item',
        published_at: '',
      },
    ],
    lastUpdated: '2025-12-10T10:03:04.038Z',
    note: 'Fallback data for SG global-nav. Updated: 12/10/2025, 6:03:04 PM',
  },
  us: {
    value: [
      {
        _uid: 'd5d895cd-1c53-460f-80b5-8c9a27dc45a8',
        desc: 'Interior Styling Service',
        link: {
          id: '',
          url: '/interior-styling-service',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/us/interior-styling-service',
        },
        name: 'Interior Styling Service',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '4b5edfd6-cde2-423a-a6a5-d9d95dfbd7a6',
        desc: 'link about reviews',
        link: {
          id: '',
          url: '/reviews',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/us/reviews',
        },
        name: 'Reviews',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '9fb1db00-b082-4cc3-a3a8-df8549534950',
        desc: 'link about referral',
        link: {
          id: '',
          url: '/referral',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/us/referral',
        },
        name: 'Refer a Friend',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '55193087-a2cf-419a-87ad-f2fb3c608f12',
        desc: 'The Castlery Club Perks',
        link: {
          id: '',
          url: '/the-castlery-club',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/us/the-castlery-club',
        },
        name: 'The Castlery Club',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '8015d392-801f-4f2a-996c-5cca00b56ba1',
        desc: 'link about contact us',
        link: {
          id: '',
          url: '/contact-us',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/us/contact-us',
        },
        name: 'Contact Us',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
    ],
    lastUpdated: '2025-12-10T10:03:05.163Z',
    note: 'Fallback data for US global-nav. Updated: 12/10/2025, 6:03:05 PM',
  },
  au: {
    value: [
      {
        _uid: '4602ef87-24c7-490d-99f2-5b1772b2510f',
        desc: 'link about Interior Styling Service',
        link: {
          id: '',
          url: '/interior-styling-service',
          target: '_self',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/interior-styling-service',
        },
        name: 'Interior Styling Service',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '2024-11-01 14:00',
      },
      {
        _uid: 'e28b4978-434c-4c77-bb93-51bd7b191574',
        desc: 'link about sydney showroom',
        link: {
          id: '',
          url: '/showrooms',
          target: '_self',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/showrooms',
        },
        name: 'Our Showrooms',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '2025-07-01 00:00',
      },
      {
        _uid: 'a72eb5d0-236c-4f4a-ab22-566c816a206e',
        desc: 'link about reviews',
        link: {
          id: '',
          url: '/reviews',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/reviews',
        },
        name: 'Reviews',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: 'c1165000-d043-46a2-b1f6-d850a0b1862a',
        desc: 'link about referrals',
        link: {
          id: '',
          url: '/referral',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/referral',
        },
        name: 'Refer a Friend',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: 'f300a4c0-f3f3-4fc5-863f-3e80324623c3',
        desc: 'The Castlery Club Perks',
        link: {
          id: '',
          url: '/the-castlery-club',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/the-castlery-club',
        },
        name: 'The Castlery Club',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '41a50478-fb9c-4856-b7a8-30d929704ab3',
        desc: 'link about contact us',
        link: {
          id: '',
          url: '/contact-us',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/au/contact-us',
        },
        name: 'Contact Us',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
    ],
    lastUpdated: '2025-12-10T10:03:05.620Z',
    note: 'Fallback data for AU global-nav. Updated: 12/10/2025, 6:03:05 PM',
  },
  ca: {
    value: [
      {
        _uid: '9fb1db00-b082-4cc3-a3a8-df8549534950',
        desc: 'link about referral',
        link: {
          id: '',
          url: '/referral',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/ca/referral',
        },
        name: 'Refer a Friend',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '55193087-a2cf-419a-87ad-f2fb3c608f12',
        desc: 'The Castlery Club Perks',
        link: {
          id: '',
          url: '/the-castlery-club',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/ca/the-castlery-club',
        },
        name: 'The Castlery Club',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '8015d392-801f-4f2a-996c-5cca00b56ba1',
        desc: 'link about contact us',
        link: {
          id: '',
          url: '/contact-us',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/ca/contact-us',
        },
        name: 'Contact Us',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
    ],
    lastUpdated: '2025-12-10T10:03:06.606Z',
    note: 'Fallback data for CA global-nav. Updated: 12/10/2025, 6:03:06 PM',
  },
  uk: {
    value: [
      {
        _uid: 'c1165000-d043-46a2-b1f6-d850a0b1862a',
        desc: 'link about referrals',
        link: {
          id: '',
          url: '/referral',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/uk/referral',
        },
        name: 'Refer a Friend',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: 'f300a4c0-f3f3-4fc5-863f-3e80324623c3',
        desc: 'The Castlery Club Perks',
        link: {
          id: '',
          url: '/the-castlery-club',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/uk/the-castlery-club',
        },
        name: 'The Castlery Club',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
      {
        _uid: '41a50478-fb9c-4856-b7a8-30d929704ab3',
        desc: 'link about contact us',
        link: {
          id: '',
          url: '/contact-us',
          linktype: 'url',
          fieldtype: 'multilink',
          cached_url: 'https://www.castlery.com/uk/contact-us',
        },
        name: 'Contact Us',
        ended_at: '',
        component: 'link_item',
        permanent: true,
        published_at: '',
      },
    ],
    lastUpdated: '2025-12-10T10:03:07.155Z',
    note: 'Fallback data for UK global-nav. Updated: 12/10/2025, 6:03:07 PM',
  },
};
