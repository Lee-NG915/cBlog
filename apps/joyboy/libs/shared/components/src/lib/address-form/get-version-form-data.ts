import { addressFormData } from './config';

export const oldVersionKeysMapping = {
  firstname: 'firstname',
  lastname: 'lastname',
  phone: 'phone',
  alternativePhone: 'alternative_phone',
  address1: 'address1',
  address2: 'address2',
  street: 'street',
  streetNumber: 'street_number',
  level: 'level',
  flat: 'flat',
  buildingType: 'building_type',
  buildingName: 'building_name',
  country: 'country',
  zipcode: 'zipcode',
  stateName: 'state_name',
  city: 'city',
  companyName: 'company_name',
};

export function getVersionFormData(useNewVersion: boolean) {
  if (useNewVersion) {
    return addressFormData;
  }
  return addressFormData.map((item) => ({
    ...item,
    // 如果映射中没有对应的 key，保留原始 key (例如 checkbox 字段)
    key: oldVersionKeysMapping[item.key as keyof typeof oldVersionKeysMapping] || item.key,
  }));
}
