export interface CheckoutFeature {
  addressFormFields: {
    key: string;
    type: 'input' | 'select';
    label: string;
    required: boolean;
    placeholder: string;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      message?: string;
    };
    value?: string;
    disabled?: boolean;
    options?: {
      value: string;
      label: string;
    }[];
  }[];
  showFloorUnitCheckbox: boolean;
  floorUnitCheckboxLabel: string;
  enabledDeliveryRequests: boolean;
}
