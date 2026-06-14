import { ProductProperty, Variant } from './product.entity';

/**
 * [
    {
        "id": 5339,
        "name": "Swatch, Performance Marcel Collection",
        "slug": "swatch-performance-marcel-collection",
        "description": "Woven to create a striking textured surface, Marcel is a modern performance fabric that's spill-resistant fabric and easy to maintain.",
        "presentation": "Performance Marcel Collection",
        "product_properties": [
            {
                "name": "fabric_composition",
                "presentation": "Fabric Composition",
                "value": "97% Polyester, 3% Acrylic; Spill-resistant Performance Fabric",
                "is_public": true,
                "is_private": false,
                "explanation": null
            },
            {
                "name": "swatch_care",
                "presentation": "Care",
                "value": "Dry clean; Do not machine wash; Do not bleach; Do not tumble dry.",
                "is_public": true,
                "is_private": false,
                "explanation": ""
            }
        ],
        "variants": [
            {
                "id": 27667,
                "name": "Swatch, Performance Smoke Grey",
                "sku": "PM-4001",
                "product_id": 5339,
                "is_customized": false,
                "presentation": "Performance Smoke Grey",
                "images": [
                    {
                        "position": 3,
                        "type": "base",
                        "links": {
                            "feed": "https://res.cloudinary.com/castlery/image/private/c_fit,f_auto,q_auto,w_1200/v1685088758/crusader/variants/PM-4001/Amber-Swivel-Chair-Smoke-Grey_1-1685088756.jpg",
                            "large": "https://res.cloudinary.com/castlery/image/private/b_rgb:FFFFFF,c_fit,f_auto,q_auto,w_1000/v1685088758/crusader/variants/PM-4001/Amber-Swivel-Chair-Smoke-Grey_1-1685088756.jpg",
                            "large_gray": "https://res.cloudinary.com/castlery/image/private/b_rgb:F3F3F3,c_fit,f_auto,q_auto,w_1000/v1685088758/crusader/variants/PM-4001/Amber-Swivel-Chair-Smoke-Grey_1-1685088756.jpg"
                        }
                    }
                ],
                "variant_properties": []
            }
        ]
    }
]
 */

export interface SwatchVariantProperty {
  explanation: string;
  id: number;
  presentation: string;
  property_id: number;
  property_name: string;
  value: string;
}

export interface SwatchVariant {
  id: number;
  name: string;
  sku: string;
  is_customized: boolean;
  presentation: string;
  product_id: number;
  variant_properties: SwatchVariantProperty[];
  images: Variant['images'] | [];
  added_order?: boolean;
}

export interface Swatch {
  id: number;
  name: string;
  slug: string;
  description: string;
  presentation: string;
  product_properties: ProductProperty[];
  variants: SwatchVariant[];
}
