import { UseFormRegisterReturn, ControllerRenderProps, UseFormWatch, UseFormReturn } from 'react-hook-form';
import { TFormValues } from './customType';

export * from './validator';
export * from './customType';

type FiledReturns = ControllerRenderProps<TFormValues, any>;

export type { UseFormRegisterReturn, FiledReturns, UseFormWatch, UseFormReturn };
