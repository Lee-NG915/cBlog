import { formJsonAU, validatorsAU } from './helper.au';
import { formJsonSG, validatorsSG } from './helper.sg';
import { formJsonUS, validatorsUS } from './helper.us';
import { formJsonCA, validatorsCA } from './helper.ca';
import { formJsonUK, validatorsUK } from './helper.uk';
import { __COUNTRY__, countryNames } from './helper.common';

export const formsMap = new Map([
  [
    'SG',
    {
      formJson: formJsonSG,
      validators: validatorsSG,
    },
  ],
  [
    'US',
    {
      formJson: formJsonUS,
      validators: validatorsUS,
    },
  ],
  [
    'AU',
    {
      formJson: formJsonAU,
      validators: validatorsAU,
    },
  ],
  [
    'CA',
    {
      formJson: formJsonCA,
      validators: validatorsCA,
    },
  ],
  [
    'UK',
    {
      formJson: formJsonUK,
      validators: validatorsUK,
    },
  ],
]);

export const formData = formsMap.get(__COUNTRY__) || {
  formJson: [],
  validators: {},
};

export const countryName = countryNames[__COUNTRY__];
