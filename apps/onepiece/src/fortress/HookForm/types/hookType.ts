import { FieldValues, Mode, DeepPartial, Resolver, ControllerRenderProps } from 'react-hook-form';
export type UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext extends object = object> = Partial<{
  mode: Mode;
  reValidateMode: Mode;
  defaultValues: DeepPartial<TFieldValues>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  shouldUnregister: boolean;
  criteriaMode: 'firstError' | 'all';
}>;
export type FiledReturns = ControllerRenderProps<FieldValues, any>;
