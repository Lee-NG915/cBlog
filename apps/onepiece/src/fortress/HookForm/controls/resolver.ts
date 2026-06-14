import { Resolver } from 'react-hook-form';
import { TFormValues } from '../types';
import { ValidChecker } from '../helpers/validChecker';

const useResolver: Resolver<TFormValues> = async (values, context, options) => {
  return {
    values,
    errors: ValidChecker.reduceErrors(values, context),
  };
};

export default useResolver;
