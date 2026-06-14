export type FormItemLayout = {
  gridColumn: { xs: string; lg: string };
};

export interface UserDomainFeature {
  phoneNumberValidator: (phone: string) => boolean;
  zipcodeValidator: (zipcode: string) => boolean;
  phoneNumberFormatter: (phone: string) => string;
  zipcodeFormatter: (zipcode: string) => string;
  showFloorUnitCheckbox: boolean;
  floorUnitCheckboxLabel: string;
}
