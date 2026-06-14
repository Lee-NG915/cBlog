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
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {}

  private plainCheck(c: PlainChecker): plainCheckReturns {
    return (value: any) => {
      let res;
      if (typeof c?.rule === 'function') {
        res = c.rule(value);
      }
      if (c?.rule instanceof RegExp) {
        res = c.rule.test(value);
      }
      const isError = typeof res === 'string' ? true : typeof res === 'boolean' ? !res : false;

      return isError
        ? {
            type: 'custom',
            message: typeof res === 'string' ? res : c?.message || messageMap.get('default') || '',
          }
        : null;
    };
  }

  private getChecker(v: Validator): plainCheckReturns {
    const c =
      typeof v === 'string' && VALIDATE_MAP.has(v.toUpperCase())
        ? VALIDATE_MAP.get(v.toUpperCase())
        : typeof v === 'object'
        ? v
        : null;
    if (!c) {
      throw Error(`[${v.toString()}]No corresponding validator found.`);
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // eslint-disable-next-line @typescript-eslint/ban-types
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
      return result ? { ...acr, [cur]: result } : acr;
    }, {});
  }
}

const instance = new ValidChecker();
export { instance as ValidChecker };
export default ValidChecker;
