type CountryString = 'SG' | 'AU' | 'US' | 'CA' | 'UK';
type CurrencyType = 'SGD' | 'AUD' | 'USD' | 'CAD' | 'GBP';

type OptionItem = {
  label: string;
  value: string;
};
type OptionsArray = Array<OptionItem>;
type MapValue = {
  [key: string]: OptionsArray;
};
type OptionsMap = Map<CountryString, MapValue>;

const occupationTextList: string[] = [
  'Junior Staff / Team Member',
  'Junior Manager (e.g. Supervisor, Team Leader)',
  'Senior Management (e.g. Department / Group Manager, VP)',
  'Executive Management (e.g. President / Partner, C-Suite)',
  'Self-employed',
  'Freelancer',
  'Part-time Worker',
  'Student',
  'Retiree',
  'Not Working',
  'Others',
];
const occupationOptions: OptionsArray = occupationTextList.map((item) => ({ label: item, value: item }));

const housingTypeTextListUS: string[] = [
  'Condo / Apartment',
  'Townhouse',
  'Single family home',
  'Multi family home',
  'Range / Farmhouse',
  'Others',
];
export const housingTypeTextListSG: string[] = [
  'HDB 1-2 room',
  'HDB 3 room',
  'HDB 4 room',
  'HDB 5 room / Exec',
  'Condo studio / 1 Bedroom',
  'Condo 2 Bedrooms',
  'Condo 3+ Bedrooms',
  'Landed Property / Shophouse',
  'Others',
];
export const housingTypeTextListAU: string[] = [
  'Flat / Apartment',
  'Granny Flat',
  'Townhouse / Terrace House',
  'Duplex / Semi-detached House',
  'Freestanding / Detached House',
  'Others',
];

export const housingSizeTextListSG: string[] = [
  'Less than 50 sqm',
  '50 sqm to <100 sqm',
  '100 sqm to <150 sqm',
  '150 sqm to <200 sqm',
  '200 sqm to <250 sqm',
  '250 sqm to <300 sqm',
  '300 sqm to <350 sqm',
  '350 sqm to <400 sqm',
  'At least 400 sqm',
  "I'm not sure",
];
export const housingSizeTextListAUUS: string[] = [
  'Less than 400 sq ft',
  '400 sq ft to <600 sq ft',
  '600 sq ft to <800 sq ft',
  '800 sq ft to <1,000 sq ft',
  '1,000 sq ft to <1,500 sq ft',
  '1,500 sq ft to <2,000 sq ft',
  '2,000 sq ft to <3,000 sq ft',
  '3,000 sq ft to <5,000 sq ft',
  'At least 5,000 sq ft',
  "I'm not sure",
];

export const incomeTextList = (type: CurrencyType): string[] => [
  `Below ${type} 35,000`,
  `${type} 35,000 to ${type} 49,999`,
  `${type} 50,000 to ${type} 74,999`,
  `${type} 75,000 to ${type} 99,999`,
  `${type} 100,000 to ${type} 149,999`,
  `${type} 150,000 to ${type} 199,999`,
  `${type} 200,000 to ${type} 249,999`,
  `${type} 250,000 to ${type} 299,999`,
  `${type} 300,000 and above`,
  'Prefer not to disclose',
];

export const roomTextList: string[] = [
  'Living Room',
  'Dining Room',
  'Bedroom',
  'Kitchen',
  'Home Office',
  'Nursery / Playroom',
  'Others',
];

const optionsMap: OptionsMap = new Map([
  [
    'SG',
    {
      occupation: occupationOptions,
      housing_type: housingTypeTextListSG.map((item) => ({ label: item, value: item })),
      home_size: housingSizeTextListSG.map((item) => ({ label: item, value: item })),
      annual_household_income: incomeTextList('SGD').map((item) => ({ label: item, value: item })),
      most_time_spent_location: roomTextList.map((item) => ({ label: item, value: item })),
    },
  ],
  [
    'AU',
    {
      occupation: occupationOptions,
      housing_type: housingTypeTextListAU.map((item) => ({ label: item, value: item })),
      home_size: housingSizeTextListAUUS.map((item) => ({ label: item, value: item })),
      annual_household_income: incomeTextList('AUD').map((item) => ({ label: item, value: item })),
      most_time_spent_location: roomTextList.map((item) => ({ label: item, value: item })),
    },
  ],
  [
    'US',
    {
      occupation: occupationOptions,
      housing_type: housingTypeTextListUS.map((item) => ({ label: item, value: item })),
      home_size: housingSizeTextListAUUS.map((item) => ({ label: item, value: item })),
      annual_household_income: incomeTextList('USD').map((item) => ({ label: item, value: item })),
      most_time_spent_location: roomTextList.map((item) => ({ label: item, value: item })),
    },
  ],
  [
    'CA',
    {
      occupation: occupationOptions,
      housing_type: housingTypeTextListUS.map((item) => ({ label: item, value: item })),
      home_size: housingSizeTextListAUUS.map((item) => ({ label: item, value: item })),
      annual_household_income: incomeTextList('CAD').map((item) => ({ label: item, value: item })),
      most_time_spent_location: roomTextList.map((item) => ({ label: item, value: item })),
    },
  ],
  [
    'UK',
    {
      occupation: occupationOptions,
      housing_type: housingTypeTextListAU.map((item) => ({ label: item, value: item })),
      home_size: housingSizeTextListSG.map((item) => ({ label: item, value: item })),
      annual_household_income: incomeTextList('GBP').map((item) => ({ label: item, value: item })),
      most_time_spent_location: roomTextList.map((item) => ({ label: item, value: item })),
    },
  ],
]);

export const getOptions = (country: CountryString): MapValue =>
  optionsMap.get(country) || {
    occupation: [],
    housing_type: [],
    home_size: [],
    annual_household_income: [],
    most_time_spent_location: [],
  };
