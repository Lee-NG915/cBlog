import { AddressOptions } from '@castlery/modules-user-domain';

export const genAddressOption = (address: AddressOptions) => {
  const { building_name = '', street_number = '', street = '', zipcode = '' } = address;
  const addressLineArr = [];

  if (building_name) {
    addressLineArr.push(building_name);
  }
  addressLineArr.push(`${street_number ? `${street_number} ` : ''}${street}`);
  addressLineArr.push(zipcode);

  return addressLineArr.join(', ');
};
