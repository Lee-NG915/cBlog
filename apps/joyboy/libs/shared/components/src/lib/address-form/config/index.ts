import { addressFormFields as addressFormFieldsUS } from './us';
import { addressFormFields as addressFormFieldsSG } from './sg';
import { addressFormFields as addressFormFieldsAU } from './au';
import { addressFormFields as addressFormFieldsCA } from './ca';
import { addressFormFields as addressFormFieldsUK } from './uk';
import { EcEnv, EC_COUNTRIES_ENUM } from '@castlery/config';

export const addressFormConfiguration = {
  [EC_COUNTRIES_ENUM.Enum.US]: addressFormFieldsUS,
  [EC_COUNTRIES_ENUM.Enum.SG]: addressFormFieldsSG,
  [EC_COUNTRIES_ENUM.Enum.AU]: addressFormFieldsAU,
  [EC_COUNTRIES_ENUM.Enum.CA]: addressFormFieldsCA,
  [EC_COUNTRIES_ENUM.Enum.UK]: addressFormFieldsUK,
};

export const addressFormData = addressFormConfiguration[EcEnv.NEXT_PUBLIC_COUNTRY];
