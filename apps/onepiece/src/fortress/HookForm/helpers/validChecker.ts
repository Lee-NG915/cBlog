import {
  TFormValues,
  StringValidator,
  PlainValidator,
  HandlerValidator,
  ValidatorsData,
  ResolverErrors,
  InstanceValidator,
  CustomErrorReturn,
} from '../types';
import { messageMap, VALIDATE_MAP } from '../config';

type Validator = StringValidator | PlainValidator | HandlerValidator;
interface PlainChecker {
  rule: RegExp | InstanceValidator;
  message?: string;
}
interface plainCheckReturns {
  (value: any): CustomErrorReturn;
}

class ValidChecker {
  constructor() {}

  private plainCheck(c: PlainChecker): plainCheckReturns {
    return (value: any) => {
      const res =
        typeof c?.rule === 'function' ? c?.rule(value) : c?.rule instanceof RegExp ? c?.rule.test(value) : false;
      const isError = typeof res === 'string' ? true : !res;
      return isError
        ? {
            type: 'custom',
            message: typeof res === 'string' ? res : c?.message || messageMap.get('default') || '',
          }
        : null;
    };
  }

  private getChecker(v: Validator): plainCheckReturns {
    let c =
      typeof v === 'string' && VALIDATE_MAP.has(v.toUpperCase())
        ? VALIDATE_MAP.get(v.toUpperCase())
        : typeof v === 'object'
        ? v
        : null;
    if (!c) {
      throw Error('No corresponding validator found.');
    }
    return this.plainCheck(c);
  }

  private requiredCheck(value: any): boolean {
    //true=>通过
    return value !== undefined && value !== null && value !== '';
  }
  private getResult(v: Validator, values: TFormValues, key: string): CustomErrorReturn {
    if (v === undefined) {
      throw Error('No matching validator found.');
    }
    if (typeof v === 'function') {
      const obj = v(values);
      return obj?.type && obj?.message ? obj : null;
    }
    return this.getChecker(v)(values[key]);
  }
  public reduceErrors(values: TFormValues, validators: ValidatorsData): ResolverErrors {
    let _this = this;
    return Object.keys(values).reduce((acr: {} | ResolverErrors, cur: string) => {
      const value = values[cur];
      const { validator, required } = validators[cur] || {};
      if (!_this.requiredCheck(value)) {
        const error = { type: 'required', message: `This field is mandatory` };
        return required ? { ...acr, [cur]: error } : acr;
      }
      if (!validator) {
        return acr;
      }
      const result = _this.getResult(validator, values, cur);
      return !!result ? { ...acr, [cur]: result } : acr;
    }, {});
  }
}

const instance = new ValidChecker();
export { instance as ValidChecker };
export default ValidChecker;
