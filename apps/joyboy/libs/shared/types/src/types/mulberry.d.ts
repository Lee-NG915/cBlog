export interface MulberryPayload {
  title?: string;
  id?: string;
  price?: string;
  images?: Array<{ src?: string }>;
  meta?: {
    breadcrumbs?: Array<{ category: string }>;
  };
}

export interface WarrantyOffer {
  id: string;
  title: string;
  price: number;
  duration_months: number;
  description?: string;
  terms?: string;
  [key: string]: any;
}
