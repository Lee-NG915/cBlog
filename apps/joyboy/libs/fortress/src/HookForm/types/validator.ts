import { TFormValues } from './customType';
export type CustomErrorType = 'required' | 'custom';
export type CustomError = {
  type: CustomErrorType;
  message: string;
};
export type CustomErrorReturn = CustomError | null;
export type StringValidator = string;
export type PlainValidator = {
  rule: RegExp;
  message: string;
};
export type HandlerValidator = {
  (values: TFormValues): CustomError | null;
};

export type ResolverErrors = {
  [keyName: string]: CustomError;
};

export type InstanceValidator = {
  (value: any): boolean | string;
};

export type ValidatorsData = {
  [keyName: string]: {
    required?: boolean;
    validator?: PlainValidator | StringValidator | HandlerValidator;
  };
};
