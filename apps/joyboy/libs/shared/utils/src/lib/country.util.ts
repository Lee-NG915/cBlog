export enum CountryCode {
  ALL = 'ALL',
  SG = 'SG',
  US = 'US',
  AU = 'AU',
  CA = 'CA',
  UK = 'UK',
}

export enum CountryName {
  ALL = 'All Reviews',
  SG = 'Singapore',
  US = 'United States',
  AU = 'Australia',
  CA = 'Canada',
  UK = 'United Kingdom',
}

export const CountryCodeToName = {
  [CountryCode.SG]: CountryName.SG,
  [CountryCode.US]: CountryName.US,
  [CountryCode.AU]: CountryName.AU,
  [CountryCode.CA]: CountryName.CA,
  [CountryCode.UK]: CountryName.UK,
};
