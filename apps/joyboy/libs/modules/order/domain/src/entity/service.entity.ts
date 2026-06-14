export type ServiceResponse = ServiceType[];
export interface ServiceType {
  id: number; //for serviceAdapter
  shipment_number: string;
  shipment_id: number;
  available_service_types: AvailableServiceType[];
}

export interface AvailableServiceType {
  display_name: string;
  display_content: string;
  type: string;
  amount: string;
}

export interface AddonServiceType {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string;
}
