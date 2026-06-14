/**
 * [
  {
    "id": 1,
    "slug": "ad-ab-modi-quia-labore-mollitia-quas-maxime-amet",
    "name": "Neque optio reprehenderit consectetur inventore rerum.",
    "contact_number": "101822992",
    "appointment_available": false,
    "lat": 74.22,
    "lng": 46.29,
    "address": "Consectetur laboriosam nemo accusantium tenetur magni quasi.",
    "parking_info": "",
    "operating_hours": "Repudiandae ipsam perspiciatis expedita quos in dolore.",
    "intro": "Cupiditate molestias nihil aut voluptatum alias.",
    "image_large": [
      "At quam quae illum cum."
    ],
    "image_small": [
      "Nisi vitae omnis excepturi corrupti."
    ],
    "new": false,
    "active": true,
    "is_public": true
  },
  {
    "id": 2,
    "slug": "deserunt-asperiores-magni-cum-voluptas-beatae",
    "name": "Corrupti nostrum odit adipisci sequi necessitatibus eum alias quae.",
    "contact_number": "101822992",
    "appointment_available": false,
    "lat": 37.25,
    "lng": 111.75,
    "address": "Libero enim id velit saepe in facere quam voluptatem.",
    "parking_info": "",
    "operating_hours": "Ut at quidem veniam repellendus laborum cumque id eveniet.",
    "intro": "In qui sequi id totam quisquam tempore.",
    "image_large": [
      "Porro voluptate rem in culpa laborum."
    ],
    "image_small": [
      "Labore cumque vitae nobis sint pariatur reprehenderit quasi iure."
    ],
    "new": false,
    "active": true,
    "is_public": true
  }
]
 */

export type Retail = {
  id: number;
  name: string;
};

export type StockLocation = {
  id: string;
  name: string;
  code?: string;
  support_self_collection?: boolean;
  ims_code?: string;
  city?: string;
  state_text?: string;
  zipcode?: string;
  location_type?: 'stock' | 'display' | 'warehouse';
};
