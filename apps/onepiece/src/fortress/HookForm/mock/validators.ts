import { StringValidator, PlainValidator, ValidatorsData } from '../types';
/**
 * 通常情况下，没有特殊业务场景，直接使用StringValidator类型实现字段校验
 * StringValidator => HookForm内置校验规则，/全局一致，容易追溯问题 & 调用简单
 * StringValidator => phone/password （正则类型 ）+ Date/Number （instance类型）//--instance 类型是新补充的，不对外暴露，仅内置在用，希望能够在遇到instance的场景，就去内置校验器增加该类型
 * 内置校验规则 => HookForm/config/validateRules.ts
 */
export const validators: ValidatorsData = {
  birth: {
    required: true,
    validator: 'Date' as StringValidator,
  },
  occupation: {
    required: true,
  },
  house: { required: true },
  approximate: { required: true },
  userName: {
    validator: {
      rule: /^[a-zA-Z\s-_]{6,12}$/g,
      message: 'Please enter a user name containing 6 to 12 characters',
    } as PlainValidator,
    required: true,
  },
  mobile: {
    required: true,
    validator: 'phoneSG',
  },
};
