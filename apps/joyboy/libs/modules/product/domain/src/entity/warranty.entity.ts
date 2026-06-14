export interface CoverageDetail {
  long: string[];
  manufacturing_defects_covered: boolean;
  short: string[];
}

export interface Retailer {
  company_name: string;
  customer_support_email: string | null;
  customer_support_phone: string | null;
  integration: string;
  settings: boolean;
}

export interface WarrantyProduct {
  external_product_id: string;
  is_subscription_eligible: boolean;
  name: string;
  price: string;
  product_detail: any | null;
  retailer: Retailer;
  variant_title: string;
}

export interface WarrantyOffer {
  annotated_category?: string | null;
  cost?: string;
  country_code?: string;
  country_name?: string;
  coverage_details?: CoverageDetail[];
  created_date?: string;
  currency?: string;
  customer_cost?: string;
  duration_months?: string;
  external_product_id?: string | null;
  id: string;
  insurer_category?: string;
  insurer_category_translations?: any[];
  mb_category?: string;
  meta?: {
    breadcrumbs: Array<{ category: string }>;
  };
  modal_image_url?: string;
  plan_type?: string | null;
  policy_terms_url?: string;
  product?: WarrantyProduct;
  program_id?: string | null;
  recommended?: boolean;
  service_type?: string;
  strikethrough_customer_cost?: string | null;
  warranty_hash?: string;
  warranty_offer_id: string;
}

export {};
